import TimeDomainWave from "@c/TimeDomainWave";
import { Button, Center, FormControl, Text, FormHelperText, FormLabel, Input, Stack, VStack, HStack, Box, Avatar, ListItem, Switch, useToast, Tag, Card, CardBody, Link, Popover, PopoverTrigger, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody, PopoverContent, useDisclosure } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ComponentProps, FC, useEffect, useMemo, useRef, useState,HTMLAttributes, MediaHTMLAttributes, forwardRef, useImperativeHandle } from "react";
import { isMobile, useCurrent } from "src/kit";
import { composeAudioStream, getName, Meetings, MyEvent, setName, User } from "src/meeting/Meetings";
import {assoc} from "ramda"

type Arrow = ()=>void

  
let TypingName : FC<{onName:(name:string)=>void}> = props => {
    let [myName,setMyName] = useState("")
    return <Center flexDir="column">
        <FormControl w={["full","md"]} padding="4" isRequired={true}>
            <FormLabel>你的名字</FormLabel>
            <Input type='text' placeholder="请输入你的名字" onInput={e=>setMyName(e.currentTarget.value)} />
            <FormHelperText>最少两个字符，最多十个字符</FormHelperText>
        </FormControl>
        <Button
        mt={4}
        onClick={()=>props.onName(myName)}
        isDisabled={myName.length<2&&myName.length>=10}
        colorScheme='teal'
        >
        进入会议
        </Button>
    </Center>
}

type MeetingHeaderProps = {
    name: string,
    onName: (name:string) => void,
    channel: string
}
let MeetingHeader : FC<MeetingHeaderProps> = props => {

    function clickName(){
        let newName = prompt("输入您的名字",props.name) || ""
        if(newName == ""){
            return 
        }else if(newName.length > 2 && newName.length < 50){
            props.onName(newName)
        }else{
            alert("字符必须大于2个并且少于50个")
        }
    }
    let router = useRouter()
    function clickChannel(){
        let newName = prompt("频道：",props.channel) || ""
        if(newName == ""){
            return 
        }else if(newName.length > 2 && newName.length < 50){
           router.push("/meeting/" + newName) 
        }else{
            alert("字符必须大于2个并且少于50个")
        }
    }
    return <HStack bg="teal.100" width="full" padding="4"  color="gray.500" flexWrap={"wrap"}>
        <Text>你好,</Text>
        <Button colorScheme="teal" onClick={clickName} variant="link">{props.name}</Button>
        <Text>欢迎来到</Text>
        <Button colorScheme="teal" onClick={clickChannel} variant="link">{props.channel}</Button>
        <Text>频道；可复制链接邀请朋友; 若需返回上一个页面点击</Text>
        <Link href={"/meeting"} colorScheme="blue">
            返回
        </Link>
    </HStack>
}
type MeetingVideoProps = {
    srcObject?: MediaStream,
    videoProps: MediaHTMLAttributes<HTMLVideoElement>,
}
type RefType = HTMLVideoElement | null
let MeetingVideo = forwardRef<RefType,MeetingVideoProps>((props,ref) => {
    let refInner = useRef<HTMLVideoElement>(null)
    useImperativeHandle<RefType,RefType>(ref,()=>{
        return refInner.current
    },[])
    useEffect(()=>{
        if(typeof refInner == "object" && refInner && refInner.current != null){
            refInner.current.srcObject = props.srcObject || null
        }
    },[props.srcObject])
    return <video  autoPlay playsInline {...props.videoProps} ref={refInner}></video>
})
type MeetingListPropsUser = {
    name: string,
    id: string,
    stream?: MediaStream
}
type MeetingListProps = {
    name: string,
    onName: (nName:string) => void
    // me: MeetingListPropsUser,
    // others: MeetingListPropsUser[]
}
function drawInitialGreen(canvas:HTMLCanvasElement){
    let ctx = canvas.getContext("2d")
    function draw(color:string){
        if(ctx == null) return
        ctx.rect(0,0,8,5)
        ctx.fillStyle = color
        ctx.fill()
        setTimeout(()=>draw(color == "green" ? "red" : "green"),1000)
    }
    draw("green")
}
let MeetingList : FC<MeetingListProps> = props => {
    let meetingRef = useRef<Meetings>()
    let defuatStreamProvider = useRef<HTMLCanvasElement>(null)
    let [me,setMe] = useState({name:props.name,id:"me"} as MeetingListPropsUser)
    let [others,setOthers] = useState([] as MeetingListPropsUser[])
    let [currentMainIndex,setMainIndex] = useState(-2)
    let mainVideo : MeetingListPropsUser
    if(currentMainIndex == -2){
        mainVideo = me
        if(others.length>0){
            mainVideo = others[0]
        }
    }else if(currentMainIndex == -1){
        mainVideo = me
    }else{
        let idx = others[currentMainIndex]?currentMainIndex:others.length-1
        mainVideo = others[idx]
    }
    let router = useRouter()
    function onName(nName:string){
        props.onName(nName)
        meetingRef.current?.changeName(nName)
    }
    useEffect(()=>{
        if(defuatStreamProvider.current == null) return
        drawInitialGreen(defuatStreamProvider.current)
        if(typeof router.query.id != "string") {
            return
        }
        let meetInfo = new Meetings(defuatStreamProvider.current,props.name,router.query.id)
        meetingRef.current = meetInfo
        meetInfo.addEventListener("localstream",e=>{
            if(e instanceof MyEvent){
                console.log("FLOW: localstream",e)
                setMe({name:props.name,stream:e.data.stream,id:"me"})
            }
        })
        meetInfo.addEventListener("users",e=>{
            if(e instanceof MyEvent){
                setOthers(others=>e.data.map((user:User)=>{
                    let old = others.find(other=>other.id = user.id)
                    let steram = old&&old.stream?old.stream:new MediaStream(user.peer.getReceivers().map(a=>a.track))
                    return {
                        id: user.id,
                        name: user.name,
                        stream: steram
                    }
                }))
            }
        })
        meetingRef.current.addEventListener("end-screen",e=>{
            setScreen(a=>({...a,opened:false}))
        })
        return () => {
            meetInfo.destory()
        }
    },[router.query.id])
    useEffect(()=>{
        setMe(a=>({...a,name:props.name}))
    },[props.name])
    let [audio,setAudio] = useState({disabled:false,opened:false})
    let [video,setVideo] = useState({disabled:false,opened:false})
    let [screen,setScreen] = useState({disabled:false,opened:false})
    let [isScreenMode,setIsScreenMode] = useState(false)
    let mainContentRef = useRef<HTMLDivElement>(null)
    let toast = useToast()
    useEffect(()=>{
        if(screen.opened){
            setVideo(a=>({...a,disabled:true}))
            setAudio(a=>({...a,disabled:true}))
        }else{
            setVideo(a=>({...a,disabled:false}))
            setAudio(a=>({...a,disabled:false}))
        }
    },[screen])
    useEffect(()=>{
        if(screen.opened){
            meetingRef.current?.turnOnMedia({audio:audio.opened,video:"screen"}).catch(err=>{
                console.log("err",err.message)
                console.dir(err)
                setScreen(a=>({...a,opened:false}))
            })
        }else{
            meetingRef.current?.turnOnMedia({audio:audio.opened,video:video.opened?"camera":"disabled"}).catch(err=>{
                toast({
                    title: "错误",
                    description: err.message,
                    isClosable: true
                })
            })
        }
    },[audio.opened,video.opened,screen.opened])
    useEffect(()=>{
        let fullscreenchange = () => {
            setIsScreenMode(a=>!a)
        }
        //如果是ipad 或者 iphone 
        if(isMobile()){
            setAudio(assoc("opened",true))
        }
        document.addEventListener("fullscreenchange",fullscreenchange)
        document.addEventListener("webkitfullscreenchange",fullscreenchange)
        return ()=>{
            document.removeEventListener("fullscreenchange",fullscreenchange)
            document.removeEventListener("webkitfullscreenchange",fullscreenchange)
        }
    },[])
    function screenMode(){
        if(isScreenMode){
            if(document.exitFullscreen) document.exitFullscreen()
            else (document as any).webkitExitFullscreen()
        }else{
            if(mainContentRef.current == null) return
            let a = mainContentRef.current
            if(a.requestFullscreen)a.requestFullscreen()
            else (a as any).webkitRequestFullscreen()
        }
    }
    let [recordState,setRecordState] = useState({state:"start",startTime:-1,lastTime:0,dataUrl:"",subfix:".webm"})
    let recordRef = useRef<any>()
    let mainVideoRef = useRef<HTMLVideoElement>(null)
    let current = useCurrent({
        me:()=>me,
        others:()=>others
    })
    useEffect(()=>{
        if(recordRef.current == null) return
        recordRef.current.diffUpdate([me,...others].map(a=>a.stream).filter(a=>a!=null) as any)
    },[others,me])
    useEffect(()=>{
        if(recordState.state == "start") {
            let cas = composeAudioStream()
            let chunks = [] as Blob[]
            let getURL = () =>  URL.createObjectURL(new Blob(chunks,{type: "video/webm;"}))
            let record = null as any as MediaRecorder
            let diffUpdate = (streams:MediaStream[]) => {
                cas.diffUpdate(streams)
            }
            let mimeType : string 
            if(MediaRecorder.isTypeSupported("video/mp4;")){
                mimeType = "video/mp4;"
                setRecordState(assoc("subfix",".mp4"))
            }else if(MediaRecorder.isTypeSupported("video/webm;")){
                mimeType = "video/webm;"
                setRecordState(assoc("subfix",".webm"))
            }else{
                mimeType = ""
            }
            record = new MediaRecorder(cas.stream,{mimeType})
            record.addEventListener("dataavailable",e=>{
                chunks.push(e.data)
                e.data.arrayBuffer().then(a=>{
                    console.log("dataavailable",a.byteLength/1000/1000+"M",chunks.length)
                })
                setRecordState(a=>{
                    URL.revokeObjectURL(a.dataUrl)
                    return {...a,dataUrl:getURL()}
                })
            })
            recordRef.current = {
                getURL,
                diffUpdate,
                start(){
                    diffUpdate([current.me(),...current.others()].map(a=>a.stream).filter(a=>a!=null) as any)
                    if(mainVideoRef.current) cas.updateVideo(mainVideoRef.current)
                    if(record.state == "paused"){
                        record.resume()
                    }else{
                        record.start()
                    }
                },
                pause(){
                    if(record.state == "inactive"){
                        void null
                    }else{
                        record.pause()
                        record.requestData() // Actively fire dataavalilable event 
                    }
                },
                stop(){
                    cas.clsoe()
                    record.stop()
                }
            }
        }else if(recordState.state == "started" && recordRef.current) {
            recordRef.current.start()
            setRecordState(a=>({...a,startTime:Date.now()}))
        }else if(recordState.state == "paused" && recordRef.current) {
            recordRef.current.pause()
            setRecordState(a=>({...a,startTime:0,lastTime:a.lastTime + Date.now() - a.startTime}))
        }else if(recordState.state == "continued" && recordRef.current) {
            recordRef.current.start()
            setRecordState(a=>({...a,startTime:Date.now()}))
        }
    },[recordState.state])

    return <Stack alignItems="center" spacing="0">
        <MeetingHeader name={props.name} channel={router.query.id as string} onName={onName}></MeetingHeader>
        <canvas width={2} height={2} style={{border:"1px solid red",display:"none"}} ref={defuatStreamProvider}></canvas>
        <HStack display={{lg:"flex",base:"none"}} w={isScreenMode?"100%":"900px"} spacing={0} boxShadow="xl" pt="4" ref={mainContentRef} >
            <Box bg="gray.300" color="white" borderRadius="lg" position="relative" borderRightRadius="none" w={isScreenMode?"calc(100% - 100px)":"800px"} height={isScreenMode?"100vh":"500px"}>
                {/* <video  autoPlay muted width="100%"></video> */}
                <Avatar name={mainVideo?.name} size="2xl" position="absolute" top="50%" left="50%" zIndex={0} transform="translate(-50%, -50%)" />
                <MeetingVideo
                ref={mainVideoRef}
                srcObject={mainVideo?.stream}
                videoProps={{autoPlay:true,muted:true,style:{margin:"auto",maxWidth:"100%",maxHeight:"100%",position:"relative",zIndex:"7",width:isScreenMode?"100%":"auto"}}} />
                <HStack position="absolute" zIndex={10} bottom="0" w="full" pl="4">
                    <FormControl display='flex' alignItems='center' w="150px">
                        <FormLabel htmlFor='email-alerts' mb='0'>
                            麦克风
                        </FormLabel>
                        <Switch isChecked={audio.opened} isDisabled={audio.disabled} onChange={()=>setAudio(a=>({...a,opened:!a.opened}))} />
                    </FormControl>
                    <FormControl display='flex' alignItems='center' w="150px">
                        <FormLabel htmlFor='email-alerts' mb='0'>
                            摄像头
                        </FormLabel>
                        <Switch isChecked={video.opened} isDisabled={video.disabled} onChange={()=>setVideo(a=>({...a,opened:!a.opened}))} />
                    </FormControl>
                    <FormControl display='flex' alignItems='center' w="150px">
                        <FormLabel htmlFor='email-alerts' mb='0'>
                            共享屏幕
                        </FormLabel>
                        <Switch isChecked={screen.opened} isDisabled={screen.disabled} onChange={()=>setScreen(a=>({...a,opened:!a.opened}))} />
                    </FormControl>
                    <Button bg="gray.400" size="sm" onClick={screenMode}>{isScreenMode?"退出全屏":"全屏模式"}</Button>
                </HStack>
                {/* <TimeDomainWave stream={mainVideo.stream} /> */}
            </Box>
            <Box background="gray.200" borderRadius="lg" borderLeftRadius="none" w="100px" height={isScreenMode?"100vh":"500px"} overflow="auto">
                {listItem(me,true,()=>setMainIndex(-1),currentMainIndex == -1)}
                {others.map((user,i)=>listItem(user,false,()=>setMainIndex(i),currentMainIndex == i))}
            </Box>
        </HStack>
        <Stack display={{lg:"none",base:"flex"}} w="400px">
            <HStack pt="4">
                <FormControl display='flex' alignItems='center' w="150px">
                    <FormLabel htmlFor='email-alerts' mb='0'>
                        麦克风
                    </FormLabel>
                    <Switch isChecked={audio.opened} isDisabled={audio.disabled} onChange={()=>setAudio(a=>({...a,opened:!a.opened}))} />
                </FormControl>
                <FormControl display='flex' alignItems='center' w="150px">
                    <FormLabel htmlFor='email-alerts' mb='0'>
                        摄像头
                    </FormLabel>
                    <Switch isChecked={video.opened} isDisabled={video.disabled} onChange={()=>setVideo(a=>({...a,opened:!a.opened}))} />
                </FormControl>
            </HStack>
            {listItem(me,true,()=>setMainIndex(-1),currentMainIndex == -1,"250px")}
            {others.map((user,i)=>listItem(user,false,()=>setMainIndex(i),currentMainIndex == i,"250px"))}
        </Stack>
        <Box h="2"></Box>
        <Card w={["full","full","xl"]}>
            <CardBody flexDir="row">
                <HStack>
                    {(()=>{
                        if(recordState.state == "start"){
                            return <Button size="sm" onClick={()=>setRecordState(a=>({...a,state:"started"}))}>开始录制</Button>
                        }else if(recordState.state == "started" || recordState.state == "continued"){
                            return <Button size="sm" onClick={()=>setRecordState(a=>({...a,state:"paused"}))}>暂停录制</Button>
                        }else{
                            return <Button size="sm" onClick={()=>setRecordState(a=>({...a,state:"continued"}))}>继续录制</Button>
                        }
                    })()}
                    {   recordState.startTime != -1 ? <TimerCounter start={recordState.startTime} last={recordState.lastTime} /> : <></>}
                    {   recordState.dataUrl != "" ? <>
                            <Popover placement='top-start'>
                                <PopoverTrigger>
                                    <Button size="sm">预览</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverHeader>预览</PopoverHeader>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody>
                                        <video src={recordState.dataUrl} controls playsInline></video>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                            <Link href={recordState.dataUrl} download={"free-meeting" + recordState.subfix}>下载</Link>
                        </>
                    :   <></>
                    }
                    <Text>录制主区域图像和所有人的声音</Text>
                </HStack>
            </CardBody>
        </Card>
    </Stack>
}
function listItem(user:MeetingListPropsUser,muted:boolean = false,onClick:()=>void,selected:boolean,height="62.5px"){
    return <Center w="full" height={height} position="relative" key={user.id} cursor="pointer" onClick={onClick} shadow={selected?"dark-lg":"none"}>
        <Avatar name={user.name} />
        <MeetingVideo
        srcObject={user.stream}
        videoProps={{autoPlay:true,muted,style:{maxWidth:"100%",maxHeight:"100%",position:"absolute",top:"50%",left:"50%",translate:"-50% -50%"}}} />
        <Tag pos="absolute" right={0} bottom={0} opacity={.5}>{user.name}</Tag>
        <TimeDomainWave stream={user.stream} />
    </Center>
}
let Meeting: NextPage<{ua:string}> = props => {
    let [myName,setMyName] = useState("")
    let onName = (name:string) => {
        setMyName(name)
        setName(name)
    }
    useEffect(() => {
        setMyName(getName())
    });

    return <>
        <Head>
            <title>自由会议</title>
            <meta name="keywords" content="自由、免费、无登陆" />
            <meta name="description" content="只需分享一个链接，即可开启多人会议" />
        </Head>
        { myName == "" ? <TypingName onName={onName}/>
        : <MeetingList onName={onName} name={myName}/>
        }
    </>
}
type TimerCounterProps = {
    start: number,
    last: number
}
function TimerCounter(props:TimerCounterProps):any{
    let [currentTime,setCurrnetTime] = useState(0)
    useEffect(()=>{
        let t = setInterval(()=>{
            setCurrnetTime(Date.now())
        },500)
        return () => {
            clearInterval(t)
        }
    },[])
    function diffCurrent(a:number){
        if(a==0) return 0
        else return currentTime - a
    }
    function mstostr(ms:number){
        if(ms < 0) return "0.0"
        let minute = Math.floor(ms/1000/60)
        let mod = Math.floor((ms/1000)%60)
        return minute + "." + mod
    }
    return <Tag>{mstostr(diffCurrent(props.start) + props.last)}m</Tag>
}
Meeting.getInitialProps = ctx => {
    let ua = ctx.req?.headers["user-agent"] || ""
    return {ua}
}
export default Meeting

