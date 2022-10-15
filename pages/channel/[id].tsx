import { Stack,chakra,useColorMode,Text, Box, IconButton, ChakraProps, Center, useColorModeValue, Tooltip, useToken, useTheme, VStack, BoxProps, TextProps, TextareaProps, useClipboard, useToast, UseModalProps, Button, Input, useDisclosure } from '@chakra-ui/react'
import type { NextPage } from 'next'
import {CopyIcon, MoonIcon,SmallAddIcon,SunIcon} from '@chakra-ui/icons'
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

type SwitchChannelProps = {
  isOpen: boolean,
  onClose: UseModalProps["onClose"],
  onOk: (a:string) => void
}
let SwitchChannel : React.FC<SwitchChannelProps> = props => {
  let [channel,setChannel] = useState({
    value: "",
    isInvalid: false
  })
  let onOk : React.MouseEventHandler<HTMLButtonElement> = e => {
    if(channel.value == ""){
      setChannel(a=>({...a,isInvalid:true}))
    }else{
      props.onOk(channel.value)
      setChannel(a=>{
        return {
          isInvalid: false,
          value: ""
        }
      })
    }
  }
  let onInput : React.FormEventHandler<HTMLInputElement> = e => {
      if(e.currentTarget.value == "" || e.currentTarget.value.trim()==""){
        setChannel(oldV => {
          return {...oldV,value:""}
        })
      }else{
        setChannel({value:e.currentTarget.value,isInvalid:false})
      }
  }
  return <Modal isOpen={props.isOpen} onClose={props.onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>切换频道</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Input variant='flushed'
      onInput={onInput}
      isInvalid={channel.isInvalid}
      value={channel.value} placeholder='输入频道名称' />
    </ModalBody>

    <ModalFooter>
      <Button colorScheme='blue' mr={3} onClick={props.onClose}>
        关闭
      </Button>
      <Button onClick={onOk} variant='ghost'>确定</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
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
  paddingTop="84px"
  paddingBottom="78px"
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
    console.log("onMessage",data)
    if(data.tag == "CInitialInfo"){
      setChatWS(ws)
      setList(data.contents.recentMessages.reverse())
      setListUpdatedVersion(Date.now())
      setMembers(data.contents.onlineMember)
    } else if(data.tag=="CIllegeData"){
      toast({
        status: "warning",
        description: "非法输入",
        isClosable: true
      })
    } else if(data.tag == "CMessage"){
      setList(list => list.concat([data.contents]).slice(0,1000))
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
      window.scrollTo(0,document.body.scrollHeight)
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
  useEffect(()=>{
    if(router.query.id == null) return
    setMe(doName()) 
    let ws = chatForChannel(router.query.id as string,
      state=>{
        setConnectionState(state)
      },
      (ws,e)=>{
      onMessageFromServer(JSON.parse(e.data),ws)
    })
    return ()=>{
      cancel(ws)
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
  let { isOpen, onOpen, onClose } = useDisclosure()
  let onConfirm: SwitchChannelProps["onOk"] = e => {
    router.push("/channel/" + e)
    onClose()
  }
  let redScheme = useColorModeValue("red.500","red.300")
  return (
    <BoxOut>
      <Head>
        <title>{id + " 频道 | 第七页"}</title>
        <meta name="keywords" content="聊天频道" />
        <meta name="description" content="随时随地不需要登陆救可以用的聊天频道" />
      </Head>
      <SwitchChannel isOpen={isOpen} onClose={onClose} onOk={onConfirm} />
      <Stack
      direction={"row"}
      zIndex="docked"
      bg={useColorModeValue("gray.200","gray.500")}
      position="fixed"
      w={["100vw",null,"xl"]}
      padding="4"
      top="0"
      alignItems={"center"}>
        <Text fontSize={"md"}>
          {router.query.id}
        </Text>
        <Text fontSize={"xs"} ml="px">
          ({members.length}人在线)
        </Text>
        {connectionState == 3 ? <Text colorScheme="red" fontSize="xs">您已断开链接</Text> : <Text fontSize="xs" colorScheme="green">连接正常{connectionState}</Text>}
        <Stack direction="row" flexGrow={1} justifyContent="flex-end">
          <Tooltip label="复制分享">
            <IconButton 
            onClick={onCopy}
            aria-label='分享' size={"sm"} icon={<CopyIcon />} />
          </Tooltip>
          <IconButton
          title="更换一个频道"
          onClick={onOpen}
          aria-label='更换一个频道' size={"sm"} icon={<SmallAddIcon />} />
          <MoonButton />
        </Stack>
      </Stack>
      <VStack spacing={12}>
        {list.map(a=><Message message={a} key={a.sender+a.time} type={a.sender == me ? "me" : "other"} />)}
      </VStack>
      <Box
      position="fixed"
      w={["100vw",null,"xl"]}
      bottom={0}
      zIndex="docked"
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
        position="absolute"
        zIndex="docked"
        boxSize={6}
        onClick={sendAction}
        right="7"
        cursor="pointer"
        top="4"
        />
      </Box>
    </BoxOut>
  )
}

TextS.getInitialProps = async (ctx) => {
  return {id:ctx.query.id as string}
}
export default TextS