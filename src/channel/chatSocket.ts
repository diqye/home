
type Events = {
  close: (ws:WebSocket,e:CloseEvent) => any,
  error?: (ws:WebSocket,e:Event) => any,
  message: (ws:WebSocket,e:MessageEvent) => any,
  open: (ws:WebSocket,e:Event) => any
}
export function chat(url:string,events:Events){
  let ws = new WebSocket(url)
  ws.addEventListener("close",e=>events.close(ws,e))
  ws.addEventListener("error",e=>events.error&&events.error(ws,e))
  ws.addEventListener("message",e=>events.message(ws,e))
  ws.addEventListener("open",e=>events.open(ws,e))
  return ws
}
export function cancel(ws:null|WebSocket,code=3001){
  ws?.close(code,"Page have left")
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

type ConnectionState = number
let chatCount = 0
export function chatForChannel(chatName:string,onOpen:any,onStateChange:(s:ConnectionState)=>void,onMessage:Events["message"]){
  let protocol = location.protocol == "http:" ? "ws:" : "wss:"
  chatCount ++ 
  let count = chatCount
  let result = {ws:null as null | WebSocket}
  let ws =  chat(`${protocol}//${location.host}/api/chat/channel/${chatName}`,{
    open(ws,e){
      // alert("open" + ws.readyState)
      ws.send(doName())
      onStateChange(ws.readyState)
      onOpen(ws)
    },
    error(ws,e){
      if(count == chatCount) onStateChange(ws.readyState)
    },
    message: onMessage,
    close(ws,e){
      if(count == chatCount) onStateChange(ws.readyState)
      if(e.code == 3001){
        void null
      }else{
        setTimeout(()=>{
          if(count == chatCount){
            result.ws = chatForChannel(chatName,onOpen,onStateChange,onMessage).ws
          }
        },5*1000)
      }
    }
  })
  result.ws = ws
  return result
}