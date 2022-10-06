import MoonButton from "@c/MoonButton";
import {Box, Button, ButtonGroup, Center, Heading,HStack,Input,Slider,SliderFilledTrack,SliderMark,SliderThumb,SliderTrack,Text, TextProps, Tooltip, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import { useCurrent } from "src/kit";
import { actx, IType, loadMusicBox, createWave } from "src/music/music";
import {lyrics,keymap} from "src/music/notes"

let VolumeSlider : FC<{
  volume:number, //0 - 100
  onChange: (volume:number) => void
}> = props => {
  return <Slider
  step={0.5}
  size="lg"
  w={["xs","md"]}
  aria-label='volume' colorScheme='pink' defaultValue={props.volume} onChange={props.onChange}>
  <SliderMark value={0} fontSize="sm" mt="2" ml="-30px"> 音量:0% </SliderMark>
  <SliderMark value={50} fontSize="sm" mt="2" ml="-15px"> 100% </SliderMark>
  <SliderMark value={100} fontSize="sm" mt="2" ml="-15px"> 200% </SliderMark>
  <SliderTrack>
    <SliderFilledTrack />
  </SliderTrack>
  <Tooltip
    hasArrow
    bg='teal.500'
    color='white'
    placement='top'
    label={`${props.volume * 2}%`}
  >
    <SliderThumb />
  </Tooltip>
</Slider>
}
let Note : FC<{note:string}> = props => {
  useEffect(()=>{
    if(props.note != ""){

    }else{
      void null
    }
  },[props.note])
  return <Text
    pointerEvents="none"
    fontSize="5xl"
    color="pink.300"
    position="fixed"
    boxShadow="md"
    p="2"
    top={["40","0"]}
    left="0"
    > ♫ {props.note}</Text>
}
let Music : NextPage = props => {
  let [chars,setChars] = useState([] as string[])
  let [char,setChar] = useState("")
  let [type,setType] = useState("bayinhe" as IType)
  let [lyricIndex,setLyricIndex] = useState(0)
  let [highlight,setHighlight] = useState({
    index : 0,
    highlight: ""
  })
  let [volume,setVolume] = useState(50)
  let [note,setNote] = useState("")
  let fns = useCurrent({
    getVolume(){
      return volume * 2 / 100
    },
    getRefresh(){
      return [lyricIndex,highlight] as const
    },
    getLyric(){
      return lyrics[lyricIndex%lyrics.length]
    }
  })
  useEffect(()=>{
    setLyricIndex(Math.trunc(Math.random()*10))
  },[])
  useEffect(()=>{
    let ctx = actx
    let bufP = loadMusicBox(ctx,type)
    let map = {} as Record<string,{indown:boolean,source?:ReturnType<typeof createWave>}>
    let keydownfn = (e:KeyboardEvent) =>{
      if(e.key.length > 1 || map[e.key]?.indown){
        return 
      }else{
        map[e.key] = {indown:true}
        bufP.then(zones=>{
          let note = keymap[e.key] || [0,""]
          let node = createWave(ctx,zones, note[0])
          map[e.key].source = node
          let gain = ctx.createGain()
          gain.gain.setValueAtTime(fns.getVolume(),ctx.currentTime)
          node?.audioNode.connect(gain)
          gain.connect(ctx.destination)
          node?.source.start(ctx.currentTime)
          node?.source.stop(ctx.currentTime+10)
          setNote(note[1])
        })
        let [lyricIndex,highlight] = fns.getRefresh()
        if(lyricIndex == -1){
          setChars(chars=>{
            return chars.slice(-7)
          })
          setChar("-"+e.key)
        }else{
          let line = fns.getLyric()[highlight.index]
          let rest = line.slice(highlight.highlight.length)
          if(rest.charAt(0) == e.key){
            let append = ""
            if(rest.charAt(1) == "-"){
               append += "-"
               if(rest.charAt(2)=="-")append += "-"
            }
            setHighlight({
              index: highlight.index,
              highlight: highlight.highlight + e.key + append
            })
          }else{
            void null
          }
        }
      }
    }
    let keyupfn = (e:KeyboardEvent) => {
      let item = map[e.key]
      if(item){
        item.indown = false
      }
      if(e.key.length > 1){
        return 
      }else{
        item?.source?.source.stop(ctx.currentTime + 0.3)
        delete map[e.key]
        let [lyricIndex,highlight] = fns.getRefresh()
        if(lyricIndex == -1){
          setChar("")
          setChars(chars=>{
            return chars.slice(-7).concat(e.key)
          })
        }else{
          let line = fns.getLyric()[highlight.index]
          if(line.length == highlight.highlight.length){
            setHighlight({
              index: highlight.index + 1 >= fns.getLyric().length ? 0 : highlight.index + 1,
              highlight: ""
            })
          }
        }
      }
    }
    document.addEventListener("keydown",keydownfn)
    document.addEventListener("keyup",keyupfn)
    return ()=>{
      document.removeEventListener("keydown",keydownfn)
      document.removeEventListener("keyup",keyupfn)
    }
  },[type])

  function afn(a:typeof type){
    if(a==type){
      return "green"
    }else{
      return undefined
    }
  }
  function bfn(a:number){
    if(lyricIndex == a){
      return "teal"
    }else if(a==0){
      return lyricIndex == -1 ? undefined : "teal"
    }else{
      return undefined
    }
  }
  function freefn(){
    return <Center
    pointerEvents="none"
    mt="0"
    w="full" h="100vh" position="fixed" top="0" left="0" opacity={.8}>
      <Heading>
        {chars.join("-")}
        <Text color="red" display="inline">{char}</Text>
      </Heading>
    </Center>
  }
  function ramdomfn(){
    type MyProps = {i:number,a?:string,fontSize:TextProps["fontSize"],children?:TextProps["children"]}
    let Line : FC<MyProps> = ({i,a,fontSize,children}) => {
        return <Text
        textAlign="center"
        fontWeight="bold"
        letterSpacing="8px"
        color={i<highlight.index?"tomato":"teal.500"}
        whiteSpace="pre-line"
        fontSize={fontSize}
        >
          {children}
        </Text>
    }
    let HightLine : FC<MyProps> = ({i,a,fontSize}) => {
      return <HStack
      borderRadius="md"
      boxShadow="dark-lg"
      p="2"
      pl="10"
      pr="10"
      spacing={2}>
        {a?.split("").map((item,i)=>{
          return <Text
          fontWeight="bold"
          color={i<highlight.highlight.length?"tomato":"teal.500"}
          key={item+i} fontSize={fontSize}>{item}</Text>
        })}
      </HStack>
    }

    return <VStack w="full" spacing="1">
      {fns.getLyric().map((a,i)=>{
        return i == highlight.index ? <HightLine key={a+i} i={i} a={a} fontSize="2xl" /> : <Line key={a+i} i={i}  fontSize="lg">{a}</Line>
      })}
    </VStack>
  }
  return <VStack spacing={0}>
    <Head>
      <title>在线弹琴</title>
    </Head>
    <HStack justify="flex-end" w={["full","md"]} p="4" spacing={["0","1"]}>
      <ButtonGroup size="sm" isAttached>
        <Button
        onClick={()=>{
          setLyricIndex(i=>i+1)
          setHighlight({index:0,highlight:""})
        }}
        colorScheme={bfn(0)}>换曲</Button>
        <Button
        onClick={()=>setLyricIndex(-1)}
        colorScheme={bfn(-1)}
        >自由</Button>
      </ButtonGroup>
      <ButtonGroup size="sm" isAttached >
        <Button
        onClick={()=>setType("bayinhe")}
        colorScheme={afn("bayinhe")}>八音盒</Button>
        <Button
        onClick={()=>setType("dagangqin")}
        colorScheme={afn("dagangqin")}
        >钢琴</Button>
        <Button
        onClick={()=>setType("guzheng")}
        colorScheme={afn("guzheng")}
        >古筝</Button>
        <Button
        onClick={()=>setType("other")}
        colorScheme={afn("other")}
        >头痛</Button>
      </ButtonGroup>
      <MoonButton />
    </HStack>
    <VolumeSlider volume={volume} onChange={a=>setVolume(a)} />
    <Box height="6"></Box>
    {lyricIndex == -1 ? freefn() : ramdomfn() }
    <Note note={note} />
    <Input
    position="fixed"
    zIndex="docked"
    w="100px"
    variant="filled"
    value="Click me"
    onChange={()=>void 0}
    _focus={{opacity:.5}}
    top="40"
    left="sm"
    size="xs"
    opacity={1} display={["block","none"]} ></Input>
  </VStack>
}

export default Music