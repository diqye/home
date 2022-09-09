
// TODO 服务限制每个channel的最近消息数量
type Events = {
  close: (ws:WebSocket,e:CloseEvent) => void,
  error: (ws:WebSocket,e:Event) => void,
  message: (ws:WebSocket,e:MessageEvent) => void,
  open: (ws:WebSocket,e:Event) => void
}
export function chat(url:string,events:Events){
  let ws = new WebSocket(url)
  ws.addEventListener("close",e=>events.close(ws,e))
  ws.addEventListener("error",e=>events.error(ws,e))
  ws.addEventListener("message",e=>events.message(ws,e))
  ws.addEventListener("open",e=>events.open(ws,e))
  return ws
}
export function cancel(ws:WebSocket){
  ws.close(1000,"Page have left")
}

export function doName(){
  let myid = localStorage.getItem("myid")
  let genName = () => new Array(7)
  .fill(0)
  .map(()=>Math.round(65+Math.random()*57))
  .map(a=>String.fromCharCode(a))
  .join("")
  if (myid != null) {
    return myid
  } else {
    myid = genName()
    localStorage.setItem("myid",myid)
    return myid
  }
}
let gws = null as WebSocket | null
export function cancelGlobal(){
  gws?.close()
}
export function chatForChannel(chatName:string,onMessage:Events["message"],retry=0){
  let protocol = location.protocol == "http:" ? "ws:" : "wss:"
  return chat(`${protocol}//${location.host}/api/chat/channel/${chatName}`,{
    open(ws,e){
      gws = ws
      ws.send(doName())
    },
    error(ws,e){
      console.error(e)
      // alert('An error appear from WebSocket')
    },
    message: onMessage,
    close(ws,e){
      if(retry == 60){
        alert("Retry over times")
      } else if([1006].indexOf(e.code) != -1) {
        if(navigator.onLine){
          setTimeout(()=>{
            chatForChannel(chatName,onMessage,retry + 1)
          },1000)
        }else{
          setTimeout(()=>{
            chatForChannel(chatName,onMessage,retry)
          },3000)
        }
      }else if([1000].indexOf(e.code) != -1){
        void null
      }else{
        alert("close" + e.code)
      }
    
      console.log("WebSocket-close",e)
    }
  })
}