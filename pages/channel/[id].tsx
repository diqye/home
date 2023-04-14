import { Stack,chakra,useColorMode,Text, Box, IconButton, ChakraProps, Center, useColorModeValue, Tooltip, useToken, useTheme, VStack, BoxProps, TextProps, TextareaProps, useClipboard, useToast, UseModalProps, Button, Input, useDisclosure } from '@chakra-ui/react'
import type { NextPage } from 'next'
import {ChevronLeftIcon, CopyIcon, MoonIcon,SmallAddIcon,SunIcon} from '@chakra-ui/icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import FlexInputAutomatically from '@c/FlexInputAutomatically'
import Sending from "src/icons/Sending"
import { useRouter } from 'next/router'
import { cancel, chatForChannel, doName } from 'src/channel/chatSocket'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import MoonButton from '@c/MoonButton'
import Head from 'next/head'
import { compose, pipe, prepend, take } from 'ramda'

type SwitchChannelProps = {
  isOpen: boolean,
  onClose: UseModalProps["onClose"],
  onOk: (a:string) => void
}

let BoxOut : React.FC<{children: React.ReactElement[]}> = props => {
  return <Box 
  width={["100vw",null,"xl"]}
  margin="auto" 
  minH="100vh"
  border="solid"
  borderColor={useColorModeValue("gray.200","gray.500")}
  borderWidth="1px"
  borderRadius="xl"
  paddingTop="140px"
  overflow="hidden"
  borderBottom="none">
    {props.children}
  </Box>
}
type MessageProps = {
  message: any,
  type: "me" | "other"
}
let Message : React.FC<MessageProps> = props => {
  let me = props.type == "me"
  let boxSetting : BoxProps
  let toolSetting : TextProps
  function formatDate(){
    let d = new Date(props.message.time)
    return d.toLocaleString()
  }
  if(me){
    boxSetting = {
      mr : "2",
      bg : useColorModeValue("teal.200","teal.500")
    }
    toolSetting = {
      right: "0"
    }
  } else {
    boxSetting = {
      ml : "2",
      bg : useColorModeValue("gray.200","gray.500")
    }
    toolSetting = {
      left: "0"
    }
  }
  return <VStack
  w="full"
  alignItems={me ? "flex-end" : "flex-start"}
  >
    <Box
    {...boxSetting}
    borderRadius="xl"
    padding="2"
    minW="20"
    maxW={["350px","500px"]}
    position="relative"
    >
      <Text
      position="absolute"
      top="-20px"
      {...toolSetting}
      fontSize="xs" color={useColorModeValue("gray.500","whiteAlpha.500")}>{props.message.sender}</Text>
      <Text fontSize="md" whiteSpace="pre-line" title={formatDate()}>{props.message.content}</Text>
    </Box>
  </VStack>
}
let isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
const TextS : NextPage<{id:string}> = ({id}) => {
  let router = useRouter()
  
  let [message,setMessage] = useState("")
  let [listUpdatedVersion,setListUpdatedVersion] = useState(0)
  let [list,setList] = useState([] as {content:string,sender:string,time:number}[])
  let [members,setMembers] = useState([] as [string,number][])
  let [me,setMe] = useState("")
  let [chatWS,setChatWS] = useState(null as WebSocket | null)
  let toast = useToast()
  
  function onMessageFromServer(data:{tag:string,contents:any},ws:WebSocket){
    if(data.tag == "CInitialInfo"){
      setChatWS(ws)
      setList(data.contents.recentMessages)
      setListUpdatedVersion(Date.now())
      setMembers(data.contents.onlineMember)
    } else if(data.tag=="CIllegeData"){
      toast({
        status: "warning",
        description: "非法输入",
        isClosable: true
      })
    } else if(data.tag == "CMessage"){
      setList(pipe(take(1000),prepend(data.contents)))
      setListUpdatedVersion(Date.now())
    } else if(data.tag == "COffLine"){
      let a = data.contents[0][1]
      // if(a != me) {
       setMembers(members => members.filter(([id])=>id != a))
      // }
    } else if(data.tag == "COnline"){
      console.log("COnline-members",members.length)
      let a = data.contents[1]
      setMembers(members => members.filter(([id])=>id != a).concat([[a,Date.now()]]))
    }
  }
  useEffect(()=>{
    if(listUpdatedVersion == 0){
      void null
    }else{
    }
  },[listUpdatedVersion])
  
  let bg = useColorModeValue("whiteAlpha.900","blackAlpha.200") 
  let sendAction = () => {
    if(message == ""){
      void null
    } else {
      chatWS?.send(JSON.stringify({
        tag: "CMessage",
        contents:{
          content:message,
          sender: "=",
          time:0,
        }
      }))
      setMessage("")
    }
  }
  let messageInputOnKeyDown : TextareaProps["onKeyDown"] = e => {
    if(e.shiftKey == false && e.code == "Enter" && isMobile() == false){
      e.preventDefault()
      sendAction() 
    }else{
      void null
    }
  }
  let [uri,setUri] = useState(router.pathname)
  let { hasCopied, onCopy } = useClipboard(uri)
  type ConnectionState = Parameters<Parameters<typeof chatForChannel>[1]>[0]
  let [connectionState,setConnectionState] = useState(0)
  useEffect(()=>{
    setUri(location.href)
  },[router.query.id])
  let [delay,setDelay] = useState(0)
  useEffect(()=>{
    if(router.query.id == null) return
    setMe(doName()) 
    class Ping {
      private ok = (a:any) => void 0
      pending(){
        return Promise.race([new Promise<any>(ok=>setTimeout(()=>ok("timeout"),3000)),new Promise((ok:any)=>this.ok = ok)])
      }
      endPing(){
        this.ok(null)
      }
    }
    let pingA = new Ping()
    let ws = chatForChannel(router.query.id as string,
      (ws:WebSocket) => {
        let count = 1
        async function ping(){
          if(ws.readyState !== ws.OPEN) return
          let time = Date.now()
          ws.send(JSON.stringify({tag:"CPing",contents:count + ""}))
          count ++ 
          let r = await pingA.pending()
          if( r == "timeout"){
            setDelay(-1)
            cancel(ws,3002)
          }else{
            setDelay(Date.now() - time)
            await new Promise(ok=>setTimeout(ok,10*1000))
            ping()
          }
        }
        setTimeout(ping,5*1000)
      },
      state=>{
        setConnectionState(state)
      },
      (ws,e)=>{
        let data = JSON.parse(e.data)
        if(data.tag == "CPing"){
          pingA.endPing()
        }else{
          onMessageFromServer(data,ws)
        }
    })
    return ()=>{
      cancel(ws.ws)
    }
  },[router.query.id])
  useEffect(()=>{
    if(hasCopied){
      toast({
        status: "success",
        position: "top",
        isClosable: true,
        description: "复制成功," + uri
      }) 
    }
  },[hasCopied])
  let redScheme = useColorModeValue("red.500","red.300")
  return (
    <BoxOut>
      <Head>
        <title>{id + " 频道 | 在线数据传输助手"}</title>
        <meta name="keywords" content="在线文件传输助手" />
        <meta name="description" content="永远绿色，永无登陆，文件传输" />
      </Head>
      <Stack
      direction={"row"}
      bg={useColorModeValue("gray.200","gray.500")}
      zIndex="docked"
      position="fixed"
      top="0"
      w={["100vw",null,"xl"]}
      padding="4"
      alignItems={"center"}>
        
        <IconButton
          title="返回"
          onClick={()=>location.href = "/channel"}
          aria-label='返回' size={"sm"} icon={<ChevronLeftIcon />} />
        <Text fontSize={"md"}>
          {router.query.id}
        </Text>
        <Text fontSize={"xs"} ml="px">
          ({members.length}人在线)
        </Text>
        {connectionState != 1 ? <Text colorScheme="red" fontSize="xs">Disconnect:{connectionState}</Text> : <Text fontSize="xs" colorScheme="green">{delay}ms</Text>}
        <Stack direction="row" flexGrow={1} justifyContent="flex-end">
          <Tooltip label="复制链接发送给朋友即可共享">
            <IconButton 
            onClick={onCopy}
            aria-label='复制链接发送给朋友即可共享' size={"sm"} icon={<CopyIcon />} />
          </Tooltip>

          <MoonButton />
        </Stack>
      </Stack>
      <Box
      w={["100vw",null,"xl"]}
      zIndex="docked"
      position="fixed"
      top="64px"
      bg={useColorModeValue("gray.200","gray.500")}
      ml="-1px"
      padding="8px 16px"
      >
        <FlexInputAutomatically
        bg={bg}
        borderColor={bg}
        aria-label="输入信息"
        value={message}
        autoFocus={true}
        placeholder="Enter发送/Shift-Enter换行"
        pr="9"
        onKeyDown={messageInputOnKeyDown}
        onInput={message=>setMessage(message)}
         />
        <Sending
        color={message.length>0?"teal":"gray"}
        transform="rotate(90deg)"
        position="absolute"
        zIndex="docked"
        boxSize={6}
        onClick={sendAction}
        right="7"
        cursor="pointer"
        top="4"
        />
      </Box>
      <VStack spacing={12}>
        {list.map(a=><Message message={a} key={a.sender+a.time} type={a.sender == me ? "me" : "other"} />)}
      </VStack>
    </BoxOut>
  )
}

TextS.getInitialProps = async (ctx) => {
  return {id:ctx.query.id as string}
}
export default TextS