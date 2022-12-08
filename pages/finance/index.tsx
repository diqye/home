import MoonButton from "@c/MoonButton";
import { HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
import { Button,chakra, VStack,Text, HStack, WrapItem, Wrap, IconButton, Menu, MenuButton, MenuList, MenuItem, Link, ResponsiveValue, LinkProps, Heading, Tabs, TabList, Tab, TabPanels, TabPanel, PinInputField, PinInput, PinInputProps, Highlight, useDisclosure, UseDisclosureProps, FormControl, FormLabel, Input, Alert, AlertIcon, CloseButton, Switch, FormErrorMessage, FormHelperText, RadioGroup, Radio, useColorModeValue } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState, FC, ChangeEvent, EventHandler, MouseEventHandler } from "react";
import { chat } from "src/channel/chatSocket";
import { createMyDataView, MyDataView, useCS, useCurrent } from "src/kit";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react' 
import { actx, createWave, loadMusicBox } from "src/music/music";
import {getMusicalKey,Doremi} from "src/music/notes"

type HightPriceProps = {
  priceStr:string,
  changeIndex: number,
  color:"red"|"green"
}
let HightPrice : FC<HightPriceProps> = props => {
  let [pre,rest] = [props.priceStr,""]
  if(props.changeIndex != -1){
    pre = props.priceStr.slice(0,props.changeIndex)
    rest = props.priceStr.slice(props.changeIndex)
  }
  return <>
    <span>{pre}</span>
    <chakra.span bg={useColorModeValue(`${props.color}.100`,`${props.color}.500`)} borderRadius="sm">{rest}</chakra.span>
  </>
}
type StackViewProps = {
  asTitle?:string,
  setAsTitle?:()=>void,
  code:string,
  href: string,
  price:number,
  fixed:number,
  remid:()=>void,
  openOrder:()=>void,
  percentage:number, // -100 to 100
}
let StockView : FC<StackViewProps> = props => {
  let rise = props.percentage >= 0
  let riseRate = props.percentage / 10000
  let open = props.price/(1+riseRate) // x(1+percentage)=price
  let diff = props.price - open
  let priceStr = props.price.toFixed(props.fixed)
  let percentageStr = rise ? "+"+Math.abs(riseRate * 100).toFixed(2) : "-" + Math.abs(riseRate * 100).toFixed(2)
  let diffStr = rise ? "+" + Math.abs(diff).toFixed(props.fixed) : "-" + Math.abs(diff).toFixed(props.fixed)
  let colorScheme = rise ? "green" : "red"
  let [twinkle,setTwinkle] = useState({old:priceStr,oldPrice:props.price,diff:-1,color:"red"})
  let timeRef = useRef(0 as any as NodeJS.Timeout)
  useEffect(()=>{
    if(props.asTitle == props.code){
      document.title = priceStr + " " +percentageStr + "%"
    }
  },[props.asTitle,priceStr])
  useEffect(()=>{
    if(twinkle.old != priceStr){
      let index = priceStr.split("").findIndex((v,i)=>twinkle.old.charAt(i) != v)
      setTwinkle({old:priceStr,diff:index,oldPrice:props.price,color:twinkle.oldPrice < props.price ? "teal":"red"})
      clearTimeout(timeRef.current)
      timeRef.current = setTimeout(()=>{
        setTwinkle(a=>({...a,diff:-1}))
      },1000)
    }else{
      void 0
    }
  },[priceStr])
  let shadow = useColorModeValue("base","dark-lg")
  return <WrapItem
      role="group"
      borderRadius="md"
      flex={["0 0 100%","0 0 260px"]}
      p="4"
      flexDirection="column"
      boxShadow={shadow}
      >
    <HStack justify="space-between" w="full">
      <Text
      colorScheme={colorScheme}
      fontWeight="bold"
      flexBasis="90px"
      fontSize="xl">
        <HightPrice priceStr={priceStr} color={twinkle.color as any} changeIndex={twinkle.diff} />
      </Text>
      <chakra.p flexGrow={1}></chakra.p>
      <Text
      colorScheme={colorScheme}
      textAlign="right"
      fontSize="sm">{diffStr}</Text> 
      <Text
      colorScheme={colorScheme}
      flexBasis="16"
      textAlign="right"
      fontSize="md">{percentageStr}%</Text>
    </HStack>
    <HStack justify="space-between" w="full" spacing={0}>
      <Link
      href={props.href}
      colorScheme="teal"
      target="trading">{props.code}</Link>
      <StockMenu setAsTitle={props.setAsTitle} remid={props.remid} openOrder={props.openOrder}/>
    </HStack>
  </WrapItem>
}

type StockMenuProps = {
  setAsTitle?: () => void,
  remid?: () => void,
  openOrder: () => void,
}
let StockMenu : FC<StockMenuProps> = props => {
  return <Menu modifiers={[]}>
  <MenuButton
    visibility="hidden"
    _groupHover={{visibility:"visible"}}
    size="sm"
    as={IconButton}
    icon={<HamburgerIcon />}
    variant='outline'
  />
  <MenuList>
    <MenuItem
    onClick={props.setAsTitle}
    icon={<SettingsIcon />}>
      放置标题
    </MenuItem>
    <MenuItem
    onClick={()=>props.remid?props.remid():void 0}
    icon={<SettingsIcon />}>
      设置提醒
    </MenuItem>
    <MenuItem
    onClick={()=>props.openOrder()}
    icon={<SettingsIcon />}>
      开仓模拟
    </MenuItem>
  </MenuList>
</Menu>
}
type Order = Extract<MessageItem,{type:"order"}>
type OrderDialogProps = {
  code: Order["code"]
  price: number,
  disclosure : Required<Pick<UseDisclosureProps,"isOpen"|"onClose">>,
  onOk : (price:Order) => void
}
let OrderDialog : FC<OrderDialogProps> = props =>{
  let [orderType,setOrderType] = useState(1)
  let [openPrice,setOpenPrice] = useState(mkPrice(0))
  let [stopPrice,setStopPrice] = useState(mkPrice(0))
  let [targetPrice,setTargetPrice] = useState(mkPrice(0))
  function mkPrice(a:number,err=false,str?:string){
    return {
      val:a,
      str:str!==undefined?str:a.toFixed(props.code[1]),
      err
    }
  }
  function parsePrice(floatstr:string){
    let a = parseFloat(floatstr)
    if(/^\-?[\.\d]+$/g.test(floatstr) && isNaN(a) == false){
      return mkPrice(a,false,floatstr)
    }else{
      return mkPrice(0,true,floatstr)
    }
  }
  function effectStopPrice(v:string){
    let ratio = 1.9
    let price = parsePrice(v)
    setStopPrice(price)
    let stopSpace = Math.abs(openPrice.val - price.val)
    setTargetPrice(mkPrice(orderType==1?openPrice.val + stopSpace * ratio:openPrice.val - stopSpace * ratio))
  }
  function onOk(){
    if([openPrice.err,stopPrice.err,targetPrice.err].reduce((a,b)=>a||b) == true){
      return
    }
    props.onOk({
      type:"order",
      code: props.code[0] as any,
      id:0,
      dir:orderType,
      open:openPrice.val,
      stop:stopPrice.val,
      target:targetPrice.val
    })
  }
  useMemo(()=>{
    if(props.disclosure.isOpen){
      setOpenPrice(mkPrice(props.price))
      setStopPrice(mkPrice(props.price))
      setTargetPrice(mkPrice(props.price))
    }
  },[props.disclosure.isOpen])
  return <Modal
    isOpen={props.disclosure.isOpen}
    onClose={props.disclosure.onClose}
  >
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>开仓 {props.code[0]} </ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6} >
      <FormControl as='fieldset' isRequired>
        <FormLabel as='legend'>开仓方向</FormLabel>
        <RadioGroup value={orderType} onChange={v=>setOrderType(parseInt(v))}>
          <HStack spacing='6'>
            <Radio value={1}>做多</Radio>
            <Radio value={0}>做空</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>
        <FormControl isRequired isInvalid={openPrice.err} >
          <FormLabel>开仓价格</FormLabel>
          <Input
          value={openPrice.str}
          onInput={e=>setOpenPrice(parsePrice(e.currentTarget.value))} />
          {openPrice.err?<FormErrorMessage>无效的价格</FormErrorMessage>:<FormHelperText></FormHelperText>}
        </FormControl>
        <FormControl isRequired isInvalid={stopPrice.err}>
          <FormLabel>止损价格</FormLabel>
          <Input
          value={stopPrice.str}
          onInput={e=>effectStopPrice(e.currentTarget.value)} />
          {stopPrice.err?<FormErrorMessage>无效的价格</FormErrorMessage>:<FormHelperText>止损更改后会自动更改止盈为止损空间的两倍</FormHelperText>}
        </FormControl>
        <FormControl isRequired isInvalid={targetPrice.err}>
          <FormLabel>止盈价格</FormLabel>
          <Input
          value={targetPrice.str}
          onInput={e=>setTargetPrice(parsePrice(e.currentTarget.value))} />
          {targetPrice.err?<FormErrorMessage>无效的价格</FormErrorMessage>:<FormHelperText></FormHelperText>}
        </FormControl>
      </ModalBody>

      <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={onOk}>
          确定
        </Button>
        <Button onClick={props.disclosure.onClose}>取消</Button>
      </ModalFooter>
    </ModalContent>
  </Modal> 
}
type RemidDialogProps = {
  price : number,
  code : string,
  fixed: number,
  disclosure : Required<Pick<UseDisclosureProps,"isOpen"|"onClose">>,
  onOk : (price:number) => void
}
let RemidDialog : FC<RemidDialogProps> = props => {
  let initialRef = useRef(null)
  let [targetPrice,setTargetPrice] = useState("")

  useMemo(()=>{
    setTargetPrice(props.price.toFixed(props.fixed))
  },[props.disclosure.isOpen])
  function onOk(){
    let price = parseFloat(targetPrice)
    if(isNaN(price)){
      void 0
    }else{
      props.onOk(price)
      props.disclosure.onClose()
    }
  }
  return <Modal
    initialFocusRef={initialRef}
    // finalFocusRef={finalRef}
    isOpen={props.disclosure.isOpen}
    onClose={props.disclosure.onClose}
  >
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>添加 {props.code} 的价格提醒</ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <FormControl isRequired isInvalid={isNaN(parseFloat(targetPrice))}>
          <FormLabel>{props.code}目标价格</FormLabel>
          <Input
          ref={initialRef}
          value={targetPrice}
          onInput={e=>setTargetPrice(e.currentTarget.value)} />
          <Text colorScheme="gray" fontSize="sm" mt="2" as="div">
            当价格<Text display="inline" colorScheme="red">{props.price.toFixed(props.fixed)}</Text>穿过{targetPrice}时提醒我
          </Text>
        </FormControl>
      </ModalBody>

      <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={onOk}>
          确定
        </Button>
        <Button onClick={props.disclosure.onClose}>取消</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}
type FinanceProps = {
  stream: ReturnType<typeof createStream<MessageData>>,
  writeStream : ReturnType<typeof createStream<MessageData>>
}
function formatNumber(n:number,fixed:number){
  if(n > 0 ){
    return "+" + Math.abs(n).toFixed(fixed)
  }else{
    return "-" + Math.abs(n).toFixed(fixed)
  }
}
let Finance : FC<FinanceProps> = props =>{
  let [quotas,setQuotas] = useState([] as Extract<MessageItem,{type:"quota"}>[])
  let [remids,setRemids] = useState([] as Extract<MessageItem,{type:"remid"}>[])
  let [orderOpened,setOrderOpened] =useState([] as Order[])
  let [asTitle,setAsTitle] = useState("XAUUSD")
  let [remidCode,setRemidCode] = useState<string>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const orderDisclosure = useDisclosure()
  let remidQuota = quotas.find(quota=>quota.code[0] == remidCode)
  function getPriceFromCode(code:string){
    let quota = quotas.find(quota=>quota.code[0] == code)
    return quota?.price??0
  }
  function onOkForRemid(price:number){
    props.writeStream.write([{
      type:"remid",
      code:remidCode as any,
      price:price,
      id:0
    }])
  }
  function onOkForOrder(order:Order){
    orderDisclosure.onClose()
    props.writeStream.write([order])
  }
  function remid(quota:NonNullable<typeof remidQuota>){
    setRemidCode(quota.code[0])
    onOpen()
  }
  function openOrder(quota:NonNullable<typeof remidQuota>){
    setRemidCode(quota.code[0])
    orderDisclosure.onOpen()
  }
  function deleteRemid(aremid:typeof remids[0]){
    if(confirm("确定要删除吗?") == false){
      return 
    }
    props.writeStream.write([{
      type:"del-remid",
      id:aremid.id
    }])
  }
  function deleteOrderOpened(id:number){
    if(confirm("确定要删除吗?") == false){
      return 
    }
    props.writeStream.write([{
      type:"del-order",
      id:id
    }])
  }
  useMemo(async ()=>{
    while(true){
      let xs = await props.stream.read()
      setQuotas(qs=>{
        let r = qs.concat([])
        xs.forEach(x=>{
          if(x.type != "quota") return
          if(r.find(q=>q.code == x.code)){
            r = r.map(q=>q.code == x.code ? x : q)
          }else{
            r.push(x)
          }
        })
        return r
      })
      setRemids(rs=>{
        let r = rs.concat([])
        let temp = [] as typeof r
        xs.forEach(x=>{
          if(x.type != "remid") return
          if(x.price == 0 || x.price == -1){
            r = r.filter(a=>a.id != x.id)
          }else{
            temp.push(x)
          }
        })
        return temp.concat(r)
      })
      setOrderOpened(oos=>{
        let oos1 = oos.concat([])
        let temp = [] as typeof oos1
        xs.forEach(x=>{
          if(x.type == "order"){
            temp.push(x)
          }else if(x.type == "del-order"){
            oos1 = oos1.filter(a=>a.id != x.id)
          } else {
            void 0
          }
        })
        return temp.concat(oos1)
      })
    }
  },[props.stream])
  let redcm = useCS("red")
  let graycm = useCS("gray")
  function confirmSong(){
    actx.resume().then(()=>{
      playSong(11)
    })
  }
  let [audioState,setAudioState] = useState("")
  useEffect(()=>{
    setAudioState(actx.state)
    actx.addEventListener("statechange",e=>{
      setAudioState(actx.state)
    })
    document.addEventListener("click",()=>{
      actx.resume()
    })
  },[])
  return <VStack>
    <HStack
    borderColor={redcm}
    justify="flex-end" w="full" p="4" pb="0">
      <Button size="sm" colorScheme="cyan" onClick={confirmSong}>{audioState == "running" ? "声音已Ok" : "任意点击激活声音"}</Button>
      <MoonButton />
    </HStack>
    <Wrap
    borderColor={redcm}
    p="4"
    spacing="4" w="full" justify="center">
      {quotas.map(quota=>{
        return <StockView
        href={quota.href}
        asTitle={asTitle}
        setAsTitle={()=>setAsTitle(quota.code[0])}
        key={quota.code[0]}
        code={quota.code[0]}
        fixed={quota.code[1]}
        price={quota.price}
        percentage={quota.percentage}
        openOrder={()=>openOrder(quota)}
        remid={()=>remid(quota)}
        />
      })}
    </Wrap>
    <Tabs size='md' w="full" variant='enclosed'>
      <TabList>
        <Tab>正在进行</Tab>
        <Tab>历史记录</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {orderOpened.map(order =>  <Alert key={order.id} status='info' variant='top-accent' fontFamily="Monaco,Menlo,monospace">
            <VStack w="full" alignItems="flex-start" color={graycm}>
              {order.id}
              {((dir:number,fixed:number)=>{
                let author = order.id >= 100 ? "π-fifth" : "me"
                if(dir == 1){
                  return <>
                    <Text colorScheme="teal" fontWeight="bold">{`Baught ${order.code[0]} by ${author} at ${order.open.toFixed(fixed)}`}</Text>
                    <Text as="div">Profit::<Text display="inline" colorScheme="red">{(getPriceFromCode(order.code[0]) - order.open).toFixed(fixed)}</Text>={getPriceFromCode(order.code[0]).toFixed(fixed)} - {order.open.toFixed(fixed)}</Text>
                    <Text as="div">Target::{order.target.toFixed(fixed)}={getPriceFromCode(order.code[0]).toFixed(fixed)}<Text display="inline" colorScheme="red">+{(order.target-getPriceFromCode(order.code[0])).toFixed(fixed)}</Text></Text>
                    <Text as="div">{"__Stop"}::{order.stop.toFixed(fixed)}={getPriceFromCode(order.code[0]).toFixed(fixed)}<Text display="inline" colorScheme="red">-{(getPriceFromCode(order.code[0]) - order.stop).toFixed(fixed)}</Text></Text>
                  </>
                }else{
                  return <>
                    <Text colorScheme="pink" fontWeight="bold">{`Sold ${order.code[0]} by ${author} at ${order.open.toFixed(fixed)}`}</Text>
                    <Text as="div">Profit::<Text display="inline" colorScheme="red">{(order.open-getPriceFromCode(order.code[0])).toFixed(fixed)}</Text>={order.open.toFixed(fixed)}-{getPriceFromCode(order.code[0]).toFixed(fixed)}</Text>
                    <Text as="div">Target::{order.target.toFixed(fixed)}={getPriceFromCode(order.code[0]).toFixed(fixed)}<Text display="inline" colorScheme="red">-{(getPriceFromCode(order.code[0]) - order.target).toFixed(fixed)}</Text></Text>
                    <Text as="div">{"__Stop"}::{order.stop.toFixed(fixed)}={getPriceFromCode(order.code[0]).toFixed(fixed)}<Text display="inline" colorScheme="red">+{(order.stop - getPriceFromCode(order.code[0])).toFixed(fixed)}</Text></Text>
                  </>

                }
              })(order.dir,order.code[1])}
            </VStack>
            <CloseButton
                alignSelf='flex-start'
                position="absolute"
                right={1}
                top={2}
                onClick={()=>deleteOrderOpened(order.id)}
              />
          </Alert>)}
          {remids.map(aremid=> <Alert
            key={aremid.id}
            variant='top-accent'
            fontFamily="Monaco,Menlo,monospace"
            color={graycm}
            status="info">
             {aremid.code[0]}{"::"}
             {aremid.price.toFixed(aremid.code[1])}
             {"="}
             {getPriceFromCode(aremid.code[0]).toFixed(aremid.code[1])}
             <Text colorScheme="red">
              {formatNumber(aremid.price - getPriceFromCode(aremid.code[0]),aremid.code[1])}
             </Text>
             <CloseButton
                alignSelf='flex-start'
                position="absolute"
                right={1}
                top={2}
                onClick={()=>deleteRemid(aremid)}
              />
            </Alert>)}
        </TabPanel>
        <TabPanel>
          <p>未开发</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <RemidDialog
    fixed={remidQuota?.code[1]??0}
    price={remidQuota?.price??0}
    code={remidQuota?.code[0]??""} onOk={onOkForRemid} disclosure={{isOpen,onClose}} />
    <OrderDialog
    code={remidQuota?.code??["XAUUSD",2]}
    price={remidQuota?.price??0}
    disclosure={{isOpen:orderDisclosure.isOpen,onClose:orderDisclosure.onClose}}
    onOk={onOkForOrder}
    />
  </VStack>
}
type VerifyCodeProps = {
  onComplete: PinInputProps["onComplete"],
  isInvalid: PinInputProps["isInvalid"]
}
let VerifyCode : FC<VerifyCodeProps> = props => {
  return <VStack
  position="fixed"
  top="50%"
  left="50%"
  alignItems="flex-start"
  transform="translate(-50%,-50%)"
  >
  <Text fontWeight="bold">输入通行码:</Text>
  <HStack>
    <PinInput
    type="alphanumeric"
    mask size="lg" onComplete={props.onComplete} isInvalid={props.isInvalid}>
      <PinInputField />
      <PinInputField />
      <PinInputField />
      <PinInputField />
      <PinInputField />
      <PinInputField />
    </PinInput>
  </HStack>
</VStack>
}
type MessageData = Awaited<ReturnType<typeof analyseBlob>>
async function analyseBlob(a:Blob){
  let buf = await a.arrayBuffer()
  let mdv = createMyDataView(buf)
  let r = [] as MessageItem[]
  while(mdv.isEnd() == false){
    let u8 = mdv.tryGet("uint8")
    if(u8 < 50){
      r.push(analyseQuota(mdv))
    }else if(u8 < 100){
      r.push(analyseRemid(mdv))
    }else if(u8 < 150){
      r.push(analyseOrder(mdv))
    }else if(u8 == 201){
      r.push(analyseOrderDeleted(mdv))
    }else{
      console.error("Unknow Blob data",a)
    }
  }
  return r
}
let codeMap = {
  1: ["XAUUSD",2],
  2: ["BTCUSD",0],
  3: ["EURUSD",5]
} as const
type MessageItem = ReturnType<typeof analyseRemid> |  ReturnType<typeof analyseQuota>  | {
  type: "del-remid",
  id:number
} | {
  type: "del-order",
  id:number
} | ReturnType<typeof analyseOrder> 
function analyseOrderDeleted(dv:MyDataView):MessageItem{
  dv.skip(1)
  return {
    type: "del-order",
    id: dv.get("uint8")
  }
}
function analyseOrder(dv:MyDataView){
  let u8 = dv.get("uint8")
  let codeInt = (u8 - 100) as keyof typeof codeMap
  let idAndDir = dv.get("uint8")
  let id = idAndDir >> 1
  let dir = idAndDir & 0x01
  let open = dv.get("float32")
  let stop = dv.get("float32")
  let target = dv.get("float32")
  return {
    type: "order" as const,
    code: codeMap[codeInt],
    id,dir,open,stop,target
  }
}
function analyseRemid(dv:MyDataView){
  let u8 = dv.get("uint8")
  let codeInt = (u8 - 50) as keyof typeof codeMap
  let id = dv.get("uint8")
  let price = dv.get("float32")
  return {
    type: "remid" as const,
    code: codeMap[codeInt],
    price,
    id
  }
}
let urlMap = {
  "XAUUSD": "https://www.tradingview.com/chart/TGMVuYM9/?symbol=OANDA%3AXAUUSD",
  "BTCUSD": "https://www.tradingview.com/chart/TGMVuYM9/?symbol=OANDA%3ABTCUSD",
  "EURUSD": "https://www.tradingview.com/chart/TGMVuYM9/?symbol=OANDA%3AEURUSD"
} as const
function analyseQuota(dv:MyDataView){
  let codeFlag = dv.get("uint8") as keyof typeof codeMap
  let percentage = dv.get("int16")
  let price = dv.get("float32")
  return {
    type: "quota" as const,
    href: urlMap[codeMap[codeFlag][0]],
    code: codeMap[codeFlag],
    price,
    percentage
  }
}
type MyEvents = {
  ready:()=>any,
  close:()=>any,
  stream: ReturnType<typeof createStream<MessageData>>,
  writeStream: ReturnType<typeof createStream<MessageData>>
}
function longloop(pins:string,events:MyEvents){
  let protocol = location.protocol == "http:" ? "ws:" : "wss:"
  let isReady = false
  // let host = "www.diqye.com" //location.host
  let host = location.host
  return chat(`${protocol}//${host}/api/input/live/1`,{
    async open(ws){
      let tencode = new TextEncoder()
      ws.send(tencode.encode(pins))
      let item : MessageData
      while(item = await events.writeStream.read()){
        ws.send(tencode.encode(JSON.stringify(item[0])))
      }
    },
    close(ws,e){
      console.log("close:",e)
      events.close()
    },
    async message(ws,e){
      if(isReady == false){
        isReady = true
        events.ready()
      }
      let quatos = await analyseBlob(e.data) 
      events.stream.write(quatos)
      alertOnVoice(quatos)
    },
    error(ws,e){
      console.log("error",e)
    }
  })
}
function createStream<T>(){
  let xs:T[] = []
  let resolves : ((v:T)=>void)[] = []
  return {
    write(a:T){
      if(resolves.length == 0){
        xs.push(a)
      }else{
        let resolve = resolves.shift()
        if(resolve)resolve(a)
      }
    },
    read():Promise<T>{
      return new Promise((resolve,reject)=>{
        if(xs.length != 0){
          let x = xs.shift()
          if(x) resolve(x)
        }else{
          resolves.push(resolve)
        }
      })
    }
  }
}
let FinanceIndex : NextPage = props =>{
  let [pins,setPins] = useState("")
  let [isInvalid,setInvalid] = useState(false)
  let [ready,setReady] = useState(false) 
  let streamRef = useRef(createStream<MessageData>())
  let writeStreamRef = useRef(createStream<MessageData>())
  useEffect(()=>{
    if(pins != ""){
      let conn = longloop(pins,{
        stream:streamRef.current,
        writeStream: writeStreamRef.current,
        ready(){
          setReady(true)
          localStorage.setItem("access-code",pins)
        },
        close(){
          setReady(false)
          setInvalid(true)
          setReady(false)
        }
      })
      return () =>{
        conn.close()
      }
    }
  },[pins])
  useEffect(()=>{
    let accessCode = localStorage.getItem("access-code") 
    if(accessCode){
      setPins(accessCode)
    }
    loadMusicBox(actx,"guzheng").then(a=>{
      zones = a
    })
  },[])
  let vp : VerifyCodeProps = {
    onComplete(v){
      setPins(v) 
    },
    isInvalid
  }
  return <>
    <Head>
      <title>金融实时数据 | 第七页</title>
      <meta name="keywords" content="黄金实时数据" />
      <meta name="description" content="金融实时数据" />
    </Head>
    {ready?<Finance writeStream={writeStreamRef.current} stream={streamRef.current} />:<VerifyCode {...vp}/>}
  </>
}
function alertOnVoice(quatos: MessageItem[]) {
  if(quatos.length == 1 && quatos[0].type != "quota"){
    if(quatos[0].type == "remid"){
      if(quatos[0].price == 0 || quatos[0].price == -1){
        playSong(0)
      }else{
        playSong(1)
      }
    } else if(quatos[0].type == "order"){
      playSong(11)
    } else if(quatos[0].type == "del-order"){
      playSong(0)
    }
  }
}
let zones = null as any
// if(typeof window != "undefined") window.abc = playSong
async function playSong(p:number){
  let c1 = 6
  let buff : any = zones || []
  let doremi = (d:Doremi,scale:number,times:readonly [number,number],major:any="C") => {
    let a = createWave(actx,buff,getMusicalKey(scale,major,d)[0],times[0])
    let gin = actx.createGain()
    gin.gain.setValueAtTime(0.5,0)
    a.audioNode.connect(gin).connect(actx.destination)
    a.source.start(times[0])
    a.source.stop(times[1])
  }
  function mkSec(){
    let t = actx.currentTime
    let sec = (v:number=1) => {
      let a = t
      t+=v
      return [a,t] as const
    }
    return sec
  }
  let sec = mkSec()
  if(p==1){
    //送别第一段
    doremi(5,c1,sec())
    doremi(3,c1,sec(0.5))
    doremi(5,c1,sec(0.5))
    doremi(1,c1+1,sec())
    sec()
    doremi(6,c1,sec())
    doremi(1,c1+1,sec())
    doremi(5,c1,sec())
    sec()
    sec()
    //送别第二段
    doremi(5,c1,sec())
    doremi(1,c1,sec(0.5))
    doremi(2,c1,sec(0.5))
    doremi(3,c1,sec())
    doremi(2,c1,sec(0.5))
    doremi(1,c1,sec(0.5))
    doremi(2,c1,sec())
  } else if(p==11){
    //声声慢第一段
    let drm = (a:Doremi,b:number,c:readonly[number,number]) => doremi(a,b,c,"E")
    drm(3,c1,sec())
    drm(5,c1,sec())
    drm(5,c1,sec())
    drm(1,c1,sec())
    drm(2,c1,sec(1.5))
    drm(1,c1,sec(0.25))
    drm(6,c1-1,sec(0.25))
    drm(6,c1-1,sec(0.5))
    drm(1,c1,sec(0.5))
    drm(1,c1,sec(0.5))
    drm(3,c1-1,sec(0.5))
    drm(5,c1-1,sec())
    sec()
    // 声声慢第二段
    drm(6,c1-1,sec(.5))
    drm(7,c1-1,sec(.5))
    drm(1,c1,sec(.5))
    drm(1,c1,sec(.25))
    drm(6,c1-1,sec(.25))
    drm(5,c1-1,sec(.5))
    drm(6,c1-1,sec(.5))
    drm(1,c1,sec())
    drm(2,c1,sec(1.5))
    drm(1,c1,sec(.5))
    drm(2,c1,sec())

  } else if(p==0){
    let _sec = mkSec()
    doremi(5,c1+1,sec(.5))
    doremi(3,c1+1,sec(.25))
    doremi(4,c1+1,sec(.25))
    doremi(5,c1+1,sec(.5))
    doremi(3,c1+1,sec(.25))
    doremi(4,c1+1,sec(.25))
    doremi(5,c1+1,sec(.25))
    doremi(7,c1,sec(.25))
    doremi(6,c1,sec(.25))
    doremi(7,c1,sec(.25))
    doremi(1,c1+1,sec(.25))
    doremi(2,c1+1,sec(.25))
    doremi(3,c1+1,sec(.25))
    doremi(4,c1+1,sec(.25))
    doremi(3,c1+1,sec(.5))
    doremi(1,c1+1,sec(.25))
    doremi(2,c1+1,sec(.25))
    doremi(3,c1+1,sec(.5))
    doremi(3,c1,sec(.25))
    doremi(4,c1,sec(.25))
    doremi(5,c1,sec(.25))
    doremi(6,c1,sec(.25))
    doremi(5,c1,sec(.25))
    doremi(4,c1,sec(.25))
    doremi(5,c1,sec(.25))
    doremi(1,c1+1,sec(.25))
    doremi(7,c1,sec(.25))
    doremi(1,c1+1,sec(.25))

    doremi(1,c1-1,_sec(.5))
    doremi(5,c1-1,_sec(.5))
    doremi(1,c1,_sec())
    doremi(5,c1-2,_sec(.5))
    doremi(2,c1-1,_sec(.5))
    doremi(7,c1-1,_sec())
    doremi(6,c1-2,_sec(.5))
    doremi(3,c1-1,_sec(.5))
    doremi(1,c1,_sec())
    doremi(3,c1-2,_sec(.5))
    doremi(3,c1-1,_sec(.5))
    doremi(5,c1-1,_sec())
  }
}
export default FinanceIndex

