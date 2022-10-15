import MoonButton from "@c/MoonButton";
import MyMusicFooter from "@c/MyFooter";
import { Text,HStack, Select, VStack, Divider, Heading, ButtonGroup, Button } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { isMobile, useCurrent } from "src/kit";
import { actx, createWave, IType, loadMusicBox } from "src/music/music";
import { expertKeymap, getExpert, gk, notes } from "src/music/notes";

type Note = typeof notes[number]
let ExpertMusic : NextPage = props =>{
  let [major,setMajor] = useState("C" as Note)
  let [aInMusicalScale,setAInMusicalScale] = useState(6)
  let [instrument,setInstrument] = useState("bayinhe" as IType)
  let [keyOnPiano,setKeyOnPiano] = useState("")
  let [actives,setActives] = useState([] as string[])
  let state = useCurrent({
    aInMusicalScale,major
  })
  
  let crosingTimeRef = useRef({
    keydown(key:string){void 0},
    keyup(key:string){void 0},
  })
  function noteDown(note:string,key:string){
    setKeyOnPiano(note)
    setActives(xs=>xs.concat(key))
  }
  function noteUp(key:string){
    setActives(xs=>xs.filter(x=>x!=key))
  }
  useEffect(()=>{
    let bufP = loadMusicBox(actx,instrument)
    let map = {} as Record<string,{indown:boolean,source?:ReturnType<typeof createWave>}>
    let keydownfn = (e:KeyboardEvent) =>{
      if(e.key.length > 1 || map[e.key]?.indown){
        return 
      }else{
        let key = e.key.toLowerCase()
        if(map[key]?.indown) return
        map[key] = {indown:true}
        bufP.then(zones=>{
          let note = getExpert(state.aInMusicalScale,state.major,key)
          if(note == null) return
          let node = createWave(actx,zones, note[0])
          map[key].source = node
          node?.audioNode.connect(actx.destination)
          node?.source.start(actx.currentTime)
          node?.source.stop(actx.currentTime+5)
          noteDown(note[1],key)
          node?.source.addEventListener("ended",()=>{
            noteUp(key)
          })
        })
      }
    }
    let keyupfn = (e:KeyboardEvent) => {
      let key = e.key.toLowerCase()
      let item = map[key]
      if(item)item.indown = false
      else return
      if(e.key.length > 1){
        return
      }else{
        // let delay = isMobile() ? .7 : .3
        let delay = .3
        item?.source?.source.stop(actx.currentTime + delay)
        delete map[e.key]
      }
    }
    crosingTimeRef.current.keydown = (key:string)=>{
      keydownfn({key} as KeyboardEvent)
    }
    crosingTimeRef.current.keyup = (key:string)=>{
      keyupfn({key} as KeyboardEvent)
    }
    document.addEventListener("keydown",keydownfn)
    document.addEventListener("keyup",keyupfn)
    return ()=>{
      document.removeEventListener("keydown",keydownfn)
      document.removeEventListener("keyup",keyupfn)
    }
  },[instrument])
  return <VStack
  w="full"
  minH="100vh"
   >
    <Head>
      <title> 钢琴模拟器 - do re mi | 第七页 </title>
      <meta name="keywords" content="八音盒模拟器,古琴模拟器,木鱼模拟器,钢琴模拟器" />
      <meta name="description" content="在线演奏音乐，包含多种乐器模拟器" />
    </Head>
    <HStack w={["full","2xl"]} pt="4">
      <Text>大调:</Text>
      <Select
      ref={e=>e?.blur()}
      flexBasis="100px"
      variant="flushed"
      size="sm"
      value={major}
      onChange={e=>setMajor(e.currentTarget.value as Note)}
      >
        {notes.map(a=><option key={a} value={a}>{a}</option>)}
      </Select>
      <Text>A所在的音阶:</Text>
      <Select
      ref={e=>e?.blur()}
      flexBasis="150px"
      variant="flushed"
      size="sm"
      value={aInMusicalScale}
      onChange={e=>setAInMusicalScale(parseInt(e.currentTarget.value))}
      >
        <option value={2}>{major}2(大字组2)</option>
        <option value={3}>{major}1(大字组1)</option>
        <option value={4}>{major}(大字组)</option>
        <option value={5}>{major.toLowerCase()}(小字组)</option>
        <option value={6}>{major.toLowerCase()}1(小字组1)</option>
        <option value={7}>{major.toLowerCase()}2(小字组2)</option>
        <option value={8}>{major.toLowerCase()}3(小字组3)</option>
      </Select>
      <Text>乐器:</Text>
      <Select
      ref={e=>e?.blur()}
      flexBasis="100px"
      variant="flushed"
      size="sm"
      value={instrument}
      onChange={e=>setInstrument(e.currentTarget.value as IType)}
      >
        <option value="bayinhe">八音盒</option>
        <option value="dagangqin">大钢琴</option>
        <option value="guzheng">古筝</option>
        <option value="woodblock">木块打击乐</option>
        <option value="other">振荡器</option>
      </Select>
      <MoonButton />
    </HStack>
    <Heading colorScheme="pink" userSelect="none">♫{keyOnPiano}</Heading>
    <VStack w="full" spacing={0}>
      {expertKeymap.map((a,i)=>lineKeys(a,aInMusicalScale,i,major,actives,{
        down(key:string) {
          crosingTimeRef.current.keydown(key)
        },
        up(key:string) {crosingTimeRef.current.keyup(key)}
      }))}
    </VStack>
    <MyMusicFooter />
  </VStack>
}
let lastTime = {} as Record<string,number>
let pd = preventDuplication
function preventDuplication(key:string,fn:Function){
  return ()=>{
    fn()
    let last = lastTime[key] || 0
    if(Date.now() - last < 300){
      void 0
    }else{
      lastTime[key] = Date.now()
    }
  }
}
let doremiLabel = ["do","re","mi","fa","sol","la","xi"] as const
function lineKeys(keys:string[],scale:number,i:number,major:Note,
  actives:string[],events:any){
  let mobile = typeof window == "undefined" ? false : isMobile()
  let keyEvents = (key:string) => mobile ? {
    onTouchStart(){
      events.down(key)
    },
    onTouchEnd(){
      events.up(key)
    }
  } : {
    onMouseDown(){
      events.down(key)
    },
    onMouseUp(){
      events.up(key)
    }
  }
  let [_,name] = gk(major,scale+(i-2))
  return <ButtonGroup
  colorScheme={i==2?"blue":undefined}
  variant="solid"
  isAttached key={keys[0]}>
    <Button w="40px" h="60px" isDisabled>{name}</Button>
    {keys.map((key,i)=><Button
      w="50px"
      h="60px"
      isActive={actives.find(a=>a==key) != null}
      flexDirection="column"
      {...keyEvents(key)}
      userSelect="none"
      key={key}>
        <Text >{key.toUpperCase()}</Text>
        <Text colorScheme="teal" fontSize="sm">{doremiLabel[i]}</Text>
      </Button>)}
  </ButtonGroup>
}
export default ExpertMusic