import { Button, Center, FormControl, Text, FormHelperText, FormLabel, Input, Stack, VStack, HStack, Box, Avatar, ListItem, Switch } from "@chakra-ui/react";
import { assert } from "console";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ComponentProps, FC, useEffect, useMemo, useRef, useState,HTMLAttributes, MediaHTMLAttributes } from "react";
import { getName, Meetings, MyEvent, setName, User } from "src/meeting/Meetings";

let TypingName : FC<{onName:(name:string)=>void}> = props => {
    let [myName,setMyName] = useState("")
    return <Center flexDir="column">
        <FormControl w="xl" paddingTop="10" isRequired={true}>
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
    onName: (name:string) => void
}
let MeetingHeader : FC<MeetingHeaderProps> = props => {

    function clickName(){
        let newName = prompt("输入您的名字",props.name) || ""
        if(newName.length > 2){
            props.onName(newName)
        }else{
            alert("名字字符太少")
        }
    }
    return <HStack bg="teal.100" width="full" padding="4" paddingLeft="16" color="gray.500">
        <Text>你好,</Text>
        <Button colorScheme="teal" onClick={clickName} variant="link">{props.name}</Button>
        <Text>分享链接即分享会议，无登陆，无广告，无安装。</Text>
    </HStack>
}
type MeetingVideoProps = {
    srcObject?: MediaStream,
    videoProps: MediaHTMLAttributes<HTMLVideoElement>,
}
let MeetingVideo : FC<MeetingVideoProps>= props => {
    let ref = useRef<HTMLVideoElement>(null)
    useEffect(()=>{
        if(ref.current == null) return
        ref.current.srcObject = props.srcObject || null
    },[props.srcObject])
    return <video {...props.videoProps} ref={ref}></video>
}
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
let MeetingList : FC<MeetingListProps> = props => {
    let meetingRef = useRef<Meetings>()
    let defuatStreamProvider = useRef<HTMLCanvasElement>(null)
    let [me,setMe] = useState({name:props.name,id:"me"} as MeetingListPropsUser)
    let [others,setOthers] = useState([] as MeetingListPropsUser[])
    let [currentMainIndex,setMainIndex] = useState(-2)
    let mainVideo
    if(currentMainIndex == -2){
        mainVideo = me.stream
        if(others.length>0){
            mainVideo = others[0].stream
        }
    }else if(currentMainIndex == -1){
        mainVideo = me.stream
    }else{
        let idx = others[currentMainIndex]?currentMainIndex:others.length-1
        mainVideo = others[idx].stream
    }
    let router = useRouter()
    function onName(nName:string){
        props.onName(nName)
        meetingRef.current?.changeName(nName)
    }
    useEffect(()=>{
        if(defuatStreamProvider.current == null) return
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
        meetInfo.addEventListener("track",e=>{
            if(e instanceof MyEvent){
                // let track = e.data.track as MediaStreamTrack
                // let userId = e.data.newUserId
                // let other = others.find(other=>other.id == userId)
                // if(other == null || other.stream == null) return
                // let stream = other.stream
                // if(track.kind == "video"){
                //     let vtracks = stream.getVideoTracks()
                //     vtracks.forEach(track=>stream.removeTrack(track))
                // }else if(track.kind == "audio"){
                //     let vtracks = stream.getAudioTracks()
                //     vtracks.forEach(track=>stream.removeTrack(track))
                // }
                // stream.addTrack(e.data.track)
            }
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
                alert(err.message)
            })
        }
    },[audio.opened,video.opened,screen.opened])
    useEffect(()=>{
        document.addEventListener("fullscreenchange",e=>{
            console.log("fullscreenchange")
            setIsScreenMode(a=>!a)
        })
    },[])
    function screenMode(){
        if(isScreenMode){
            document.exitFullscreen()
            // setIsScreenMode(false)
        }else{
            mainContentRef.current?.requestFullscreen()
            // setIsScreenMode(true)
        }
    }
    return <Stack alignItems="center" spacing="0">
        <MeetingHeader name={props.name} onName={onName}></MeetingHeader>
        <canvas width={4} height={3} style={{border:"1px solid red",display:"none"}} ref={defuatStreamProvider}></canvas>
        <HStack w={isScreenMode?"100%":"900px"} spacing={0} boxShadow="xl" pt="4" ref={mainContentRef} >
            <Box bg="gray.300" color="white" borderRadius="lg" position="relative" borderRightRadius="none" w={isScreenMode?"calc(100% - 100px)":"800px"} height={isScreenMode?"100vh":"500px"}>
                {/* <video  autoPlay muted width="100%"></video> */}
                <Avatar name={me.name} size="2xl" position="absolute" top="50%" left="50%" zIndex={0} transform="translate(-50%, -50%)" />
                <MeetingVideo
                srcObject={mainVideo}
                videoProps={{autoPlay:true,muted:false,style:{margin:"auto",maxWidth:"100%",maxHeight:"100%",position:"relative",zIndex:"7",width:isScreenMode?"100%":"auto"}}} />
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
                    <Button bg="gray.400" onClick={screenMode}>{isScreenMode?"退出全屏":"全屏模式"}</Button>
                </HStack>
            </Box>
            <Box background="gray.200" borderRadius="lg" borderLeftRadius="none" w="100px" height={isScreenMode?"100vh":"500px"} overflow="auto">
                {listItem(me,true,()=>setMainIndex(-1),currentMainIndex == -1)}
                {others.map((user,i)=>listItem(user,false,()=>setMainIndex(i),currentMainIndex == i))}
            </Box>
        </HStack>
    </Stack>
}
function listItem(user:MeetingListPropsUser,muted:boolean = false,onClick:()=>void,selected:boolean){
    return <Center w="full" height="62.5px" position="relative" key={user.id} cursor="pointer" onClick={onClick} shadow={selected?"2xl":"none"}>
        <Avatar name={user.name} />
        <MeetingVideo
        srcObject={user.stream}
        videoProps={{autoPlay:true,muted,style:{maxWidth:"100%",maxHeight:"100%",position:"absolute",top:"50%",left:"50%",translate:"-50% -50%"}}} />
    </Center>
}
let Meeting: NextPage = props => {
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
            <title>免费在线会议</title>
            <meta name="keywords" content="自由、免费、无登陆" />
            <meta name="description" content="自由免费无登陆" />
        </Head>
        {myName == "" ? <TypingName onName={onName}/> : <MeetingList onName={onName} name={myName}/>}
    </>
}
export default Meeting

