import { doName } from "src/channel/chatSocket"
/**
strun servers available for china 
stun:stun1.l.google.com:19302
stun:stun2.l.google.com:19302
stun:stun3.l.google.com:19302
stun:stun4.l.google.com:19302
stun:23.21.150.121
Stun:stun01.sipphone.com
Stun:stun.ekiga.net
Stun:stun.fwdnet.net
Stun:stun.ideasip.com
stun:stun.iptel.org
stun:stun.rixtelecom.se
Stun:stun.schlund.de
stun:stunserver.org
Stun:stun.softjoys.com
Stun:stun.voiparound.com
Stun:stun.voipbuster.com
Stun:stun.voipstunt.com
stun:stun.voxgratia.org
Stun:stun.xten.com 
const config = {
  iceServers: [{ urls: "stun:stun.xten.com " }],
};

icecandate 事件不触发
1. 需要配置ice servers
2. 需要添加进去Track（addTrack)
 */


export class MyEvent extends Event {
    data = null as any
    constructor(type:string,val:any){
        super(type)
        this.data = val
    }
}
export type User = {
    id: string,
    name: string,
    peer: RTCPeerConnection,
    audioSender: RTCRtpSender,
    videoSender: RTCRtpSender,
}
type CMsg<T=any> = {
    c_type : string,
    c_content : T,
    c_receiver: string,
    c_sender: string
}
function getWhiteAudioStream(){
    let ctx = new AudioContext()
    let streamDestination = ctx.createMediaStreamDestination()
    // let os = ctx.createOscillator()
    // os.type = "sine"
    // os.frequency.setValueAtTime(261,ctx.currentTime)
    // os.connect(streamDestination)
    // os.start()
    return streamDestination.stream
}
export class Meetings extends EventTarget {
    private ws?: WebSocket
    private users: User[]=[]
    private myself?: {
        id:string,
        name:string,
        currentAudioStrack: MediaStreamTrack, 
        currentVideoStrack: MediaStreamTrack,
        whiteAudioStrack: MediaStreamTrack,
        whiteVideoStrack: MediaStreamTrack,
    }
    private queue = [] as Function[]
    constructor(whiteProvider:HTMLCanvasElement,name:string,chatName1:string){
        super()
        let protocol = location.protocol == "http:" ? "ws:" : "wss:"
        let chatName = "@meeting@" + chatName1
        let stream = whiteProvider.captureStream()
        let videoTrack = stream.getTracks()[0]
        let audioStream = getWhiteAudioStream()
        let audioTrack = audioStream.getAudioTracks()[0]
        this.ws = new WebSocket(`${protocol}//${location.host}/api/chat/channel/${chatName}`)
        let id = doName()
        this.myself = {
            id,
            name,
            whiteAudioStrack: audioTrack,
            whiteVideoStrack: videoTrack,
            currentAudioStrack: audioTrack,
            currentVideoStrack: videoTrack
        }
        this.ws.addEventListener("open",()=>{
            this.ws?.send(id)
        })
        this.handleUsers()
        // navigator.mediaDevices.getUserMedia({audio:true,video:false}).then(stream=>{
        //     let audioTrack = stream.getAudioTracks()[0]
        //     audioTrack.enabled = false
        //     this.ws = new WebSocket(`${protocol}//${location.host}/api/chat/channel/${chatName}`)
        //     let id = doName()
        //     this.myself = {
        //         id,
        //         name,
        //         whiteAudioStrack: audioTrack,
        //         whiteVideoStrack: videoTrack,
        //         currentAudioStrack: audioTrack,
        //         currentVideoStrack: videoTrack
        //     }
        //     this.ws.addEventListener("open",()=>{
        //         this.ws?.send(id)
        //     })
        //     this.handleUsers()
        // }).catch(e=>{
        //     alert("获取基础流失败，无法进行下一步！")
        // })
    }
    createPeer(newUserId:string){
        let peer = new RTCPeerConnection({
            iceServers: [{
                urls: "stun:any.turn.whereby.com",
            }],
        })
        peer.addEventListener("icecandidate",e=>{
            console.log("icecandidate",e)
            if(e.candidate){
                this.sendSignaling({
                    tag: "CMessage",
                    contents: {
                        c_type: "ice",
                        c_content:  e.candidate.toJSON(),
                        c_receiver: newUserId,
                        c_sender: "="
                    } 
                })
            }
        })
        
        console.log("FLOW: add track",newUserId)
        if(!this.myself)return null as any
        let audioSender = peer.addTrack(this.myself.currentAudioStrack)
        let videoSender = peer.addTrack(this.myself.currentVideoStrack)
        peer.addEventListener("track",e=>{
            console.log("FLOW: Listen track event",newUserId,e.track)
            this.dispatchEvent(new MyEvent("track",{
                userId: newUserId,
                track:e.track,
                stream: e.streams[0]
            }))
        })
         return {peer,audioSender,videoSender}
    }
    private addIce(iceMsg:CMsg){
        let user = this.users.find(val=>val.id == iceMsg.c_sender)
        if(user){
            user.peer.addIceCandidate(iceMsg.c_content)
            console.log("FLOW:  Add icecandidate",user.id)
        }
    }
    private updateName(msg:CMsg,queue=true){
        let user = this.users.find(val=>val.id == msg.c_sender)
        if(user){
            user.name = msg.c_content
            this.dispatchEvent(new MyEvent("users",this.users.concat([])))
        }else if(queue){
            this.queue.push(()=>{
                this.updateName(msg,false)
            })
        }
    }
    private doQueue(){
        let task = this.queue.pop()
        if(task){
            task()
            this.doQueue()
        }
    }
    private sendMyself(toId:string){
        if(!this.myself)return
        this.sendSignaling({
            tag: "CMessage",
            contents: {
                c_type: "myself",
                c_content: this.myself.name,
                c_receiver: toId,
                c_sender: "="
            }
        })
    }
    public changeName(name:string){
        if(!this.myself)return
        this.myself.name = name
        this.users.forEach(u=>{
            this.sendMyself(u.id)
        })
    }
    private handleUsers(){
        if(!this.ws)return
        this.ws.addEventListener("message",e=>{
            let json = JSON.parse(e.data)
            if(json.tag == "CInitialInfo"){

            }else if(json.tag == "COnline"){
                let newUserId = json.contents[1]
                this.connectPeerByOffer(newUserId)
                this.sendMyself(newUserId)
            }else if(json.tag == "CMessage"){
                if(json.contents.c_type == "offer"){
                    this.connectPeerByAnswer(json.contents)
                    this.sendMyself(json.contents.c_sender)
                } else if(json.contents.c_type == "ice") {
                    this.addIce(json.contents)
                } else if(json.contents.c_type == "myself"){
                    this.updateName(json.contents)
                } else if(json.contents.c_type == "answer"){
                    this.setAnswer(json.contents)
                }
            }else if(json.tag == "COffLine"){
                let userId = json.contents[0][1]
                this.users = this.users.filter(a=>{
                    if(a.id != userId){
                        return true
                    }else{
                        a.peer.close()
                    }
                })
                this.dispatchEvent(new MyEvent("users",this.users.concat([])))
            }
            console.log("message:",json)
        })
    }
    async setAnswer(msg:CMsg<RTCSessionDescriptionInit>){
        let user = this.users.find(v=>v.id == msg.c_sender) 
        if(user){
            user.peer.setRemoteDescription(msg.c_content)
            console.log("FLOW: Set remote description answer",user.id)
        }
    }
    async connectPeerByAnswer(msg:CMsg<RTCSessionDescriptionInit>){
        let exiting = this.users.find(v=>v.id == msg.c_sender) 
        if(exiting){
            return
        }
        let {peer,audioSender,videoSender} = this.createPeer(msg.c_sender)
        peer.setRemoteDescription(msg.c_content)
        let answer = await peer.createAnswer()
        this.sendSignaling({
            tag: "CMessage",
            contents: {
                c_type: "answer",
                c_content: {type:"answer",sdp:answer.sdp},
                c_receiver: msg.c_sender,
                c_sender: "="
            }
        })
        peer.setLocalDescription(answer)
        this.users.push({
            id: msg.c_sender,
            name: "",
            peer: peer,
            audioSender,
            videoSender
        })
        this.doQueue()
        this.dispatchEvent(new MyEvent("users",this.users.concat([])))
        console.log("FLOW: Create answer and set remote description and local description",msg.c_sender)
    }
    async connectPeerByOffer(newUserId: string) {
        let exiting = this.users.find(v=>v.id == newUserId) 
        if(exiting){
            return
        }
        let {peer,audioSender,videoSender} = this.createPeer(newUserId)
        let offer = await peer.createOffer({
            // iceRestart: false,
            offerToReceiveVideo: true,
            offerToReceiveAudio: true
        })
        await peer.setLocalDescription(offer)
        this.sendSignaling({
            tag: "CMessage",
            contents: {
                c_type: "offer",
                c_content: {type:"offer",sdp:offer.sdp},
                c_receiver: newUserId,
                c_sender: "="
            }
        })
        this.users.push({
            id: newUserId,
            name: "",
            peer: peer,
            audioSender,
            videoSender
        })
        this.doQueue()
        this.dispatchEvent(new MyEvent("users",this.users.concat([])))
        console.log("FLOW: Create offer and set local description",newUserId)
    }
    sendSignaling(json:any){
        this.ws?.send(JSON.stringify(json))
    }
    async turnOnMedia(config:{audio:boolean,video:"camera" | "screen" | "disabled"}){
        if(!this.myself) return
        let stream 
        if(config.video == "camera"){
            stream = await navigator.mediaDevices.getUserMedia({audio:config.audio,video:{
                width:{exact:1000},
                height:{exact:625}
            }})
            if(config.audio == false) stream.addTrack(this.myself.whiteAudioStrack)
        }else if(config.video == "screen"){
            stream = await navigator.mediaDevices.getDisplayMedia({audio:false,video:true})
            stream.getVideoTracks()[0].addEventListener("ended",()=>{
                this.dispatchEvent(new MyEvent("end-screen",null))
                // config.video = "disabled"
                // this.turnOnMedia(config)
            })
            if(config.audio == false) {
                stream.addTrack(this.myself.whiteAudioStrack)
            }
            else {
                let audioStream = await navigator.mediaDevices.getUserMedia({audio:true,video:false})
                stream.addTrack(audioStream.getAudioTracks()[0])
            }
        }else if(config.audio == true){
            stream = await navigator.mediaDevices.getUserMedia({audio:config.audio,video:false})
            stream.addTrack(this.myself.whiteVideoStrack)
        }else{
            stream = new MediaStream([this.myself.whiteVideoStrack,this.myself.whiteAudioStrack])
        }
        this.dispatchEvent(new MyEvent("localstream",{stream}))
        let audio = stream.getAudioTracks()[0]
        let video = stream.getVideoTracks()[0]
        if(this.myself.currentVideoStrack != this.myself.whiteVideoStrack){ 
            console.log("FLOW: stop last video strack",this.myself)
            this.myself.currentVideoStrack?.stop()
        }
        if(this.myself.currentAudioStrack != this.myself.whiteAudioStrack){
            console.log("FLOW: stop last audio strack",this.myself)
            this.myself.currentAudioStrack?.stop()
        }
        this.users.forEach(user=>{
            user.audioSender.replaceTrack(audio)
            user.videoSender.replaceTrack(video)
        })
        this.myself.currentAudioStrack = audio
        this.myself.currentVideoStrack = video

    }

    destory(){
        this.users.forEach(user=>{
            user.peer.close()
        })
        this.ws?.close()
    }
}
const MEETINGNAME = "meeting-name"
export function getName(){
    return localStorage.getItem(MEETINGNAME) || ""
}
export function setName(name:string){
    localStorage.setItem(MEETINGNAME,name)
}

/*
async function getScreen() {
    let mediaStrem = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
    mediaStrem.getAudioTracks()[0].addEventListener("ended", () => {
        console.log("ended screen")
    })
    return mediaStrem
}
async function getAudio() {
    let mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    })
    mediaStream.getAudioTracks()[0].enabled = false
    mediaStream.getVideoTracks()[0].enabled = false

    return mediaStream
}
async function createPeer() {
    let peer = new RTCPeerConnection({
        iceServers: [{
            urls: "stun:23.21.150.121",
            // username: "diqye",
            // credential: "diqyepassword"
        }],
    })
    peer.addEventListener("connectionstatechange", e => {
        console.log("connection state change", e)
    })
    peer.addEventListener("icecandidate", e => {
        console.log("icecandidate", e.candidate)
    })
    peer.addEventListener("track", e => {
        console.log("track", e)
    })
    return peer
}
async function rtctest(cbk: (stream: MediaStream) => void) {
    // let mediaStream = await getScreen()
    // let mediaStream = await getAudio()
    // cbk(mediaStream)
    let peer = await createPeer()
    // let tracks = mediaStream.getTracks()
    // for(let track of tracks){
    //     console.log(track.id,track.muted,track.kind,track.label)
    //     peer.addTrack(track,mediaStream)
    // }
    await peer.setLocalDescription()
    console.log("localDescription", peer.localDescription?.sdp)
}
function errorHandle(e: Error) {
    if (e instanceof DOMException) {
        if (e.name == "NotAllowedError") {
            alert("权限不允许")
        } else {
            console.log("dom exception", e.message, e.name)
        }
    } else {
        console.log("err handle", e)
    }
}
*/

export function mixTracks(track1:MediaStreamTrack,track2:MediaStreamTrack):MediaStreamTrack{
    const audioContext = new AudioContext()
    let audioIn_01 = audioContext.createMediaStreamSource(new MediaStream([track1]))
    let audioIn_02 = audioContext.createMediaStreamSource(new MediaStream([track2]))
    let dest = audioContext.createMediaStreamDestination()

    audioIn_01.connect(dest)
    audioIn_02.connect(dest)
    audioContext.close()
    return dest.stream.getAudioTracks()[0]
}
export function composeAudioStream(){
    let audioContext = new AudioContext()
    let dest = audioContext.createMediaStreamDestination()
    // 给一个默认的音频数据流，解决无音频情况下音视频不同步的问题
    let osi = audioContext.createOscillator()
    osi.frequency.setValueAtTime(1,0)
    let gain = audioContext.createGain()
    gain.gain.setValueAtTime(0,0)
    osi.type = "sine"
    osi.start()
    osi.connect(gain).connect(dest)
    let sources = [] as MediaStreamAudioSourceNode[]
    let canvas = document.createElement("canvas")
    const WIDTH = 1440,HEIGHT = 900
    canvas.width = WIDTH
    canvas.height = HEIGHT
    let canvasCtx = canvas.getContext("2d")
    let repaintId = 0 as any as NodeJS.Timer
    if(canvasCtx){
        emptyStream(canvasCtx)
        let canvasS = canvas.captureStream()
        dest.stream.addTrack(canvasS.getVideoTracks()[0])
    }
    function emptyStream(ctx:CanvasRenderingContext2D,){
        ctx.clearRect(0,0,WIDTH,HEIGHT)
        ctx.fillStyle = "#0F0"
        ctx.font = "bold 52px serif"
        ctx.fillText("没有开启视频(diqye.com)" ,300,300)
    }
    return {
        stream:dest.stream,
        updateVideo(element?:HTMLVideoElement){
            if(canvasCtx == null) return
            clearInterval(repaintId)
            if(element){
                // 此处不能使用requestAnimationFrame, 其只在当前页面活跃的情况下才会执行回调，会导致分享桌面的时丢失视频。
                repaintId = setInterval(() => {
                    if(canvasCtx == null) return
                    // wh = w / h
                    // wh = wx / h -> wx = wh * h
                    // wh = w / hx -> w = wh * hx -> hx = w / wh
                    let w = element.videoWidth
                    if(w < 5){
                        emptyStream(canvasCtx)
                        return
                    }
                    let h = element.videoHeight
                    let wh = w / h
                    if(wh >= 1.5){
                        canvasCtx.drawImage(element,0,0,WIDTH,WIDTH/wh)
                    }else{
                        canvasCtx.drawImage(element,0,0,HEIGHT*wh,HEIGHT)
                    }
                },100) // 如不指定间隔毫秒，经常会卡死
            }else{
                emptyStream(canvasCtx)
            }
        },
        addStream(stream:MediaStream){
            let source = audioContext.createMediaStreamSource(stream)
            source.connect(dest)
            sources.push(source) 
        },
        diffUpdate(streams:MediaStream[]){
            let exsits = [] as typeof sources
            let deletes = [] as typeof sources
            let news = [] as typeof sources
            streams.forEach(stream=>{
                let a = sources.find(source=>{
                    return source.mediaStream.id == stream.id
                })
                if(a){
                    exsits.push(a)
                }else{
                    let source = audioContext.createMediaStreamSource(stream)
                    source.connect(dest)
                    news.push(source)
                }
            })
            sources.forEach(source=>{
                let a = streams.find(stream=>stream.id == source.mediaStream.id)
                if(a){
                    void null
                }else{
                    source.disconnect(dest)
                    deletes.push(source)
                }
            })
            sources = exsits.concat(news)
            console.log("diffUpdate...",exsits,deletes,news)
        },
        clsoe(){
            audioContext.close()
        }
    }
}