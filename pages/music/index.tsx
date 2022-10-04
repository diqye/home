import MoonButton from "@c/MoonButton";
import {Button, ButtonGroup, Center, Heading,HStack,Input,Text, TextProps, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import { useCurrent } from "src/kit";
import { actx, IType, loadMusicBox, playWave } from "src/music";
let n = 2
let notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const
function gk(note:typeof notes[number],n:number){
  return notes.indexOf(note) + (n * 12)
}
let keymap = {
  "1":gk("C",2),
  "2":gk("D",2),
  "3":gk("E",2),
  "4":gk("F",2),
  "5":gk("G",2),
  "6":gk("A",2),
  "7":gk("B",2),
  "8":gk("C",3),
  "9":gk("D",3),
  "0":gk("E",3),
  "q":gk("F",3),
  "w":gk("G",3),
  "e":gk("A",3),
  "r":gk("B",3),
  "t":gk("C",4),
  "y":gk("D",4),
  "u":gk("E",4),
  "i":gk("F",4),
  "o":gk("G",4),
  "p":gk("A",4),
  "a":gk("B",4),
  "s":gk("C",5),
  "d":gk("D",5),
  "f":gk("E",5),
  "g":gk("F",5),
  "h":gk("G",5),
  "j":gk("A",5),
  "k":gk("B",5),
  "l":gk("C",6),
  "z":gk("D",6),
  "x":gk("E",6),
  "c":gk("F",6),
  "v":gk("G",6),
  "b":gk("A",6),
  "n":gk("B",6),
  "m":gk("C",7),

} as Record<string,number>
let lyrics = [`
opsdfapaop
sdfhjsdfgf
fhjhjpfdsd
fopafps
hhjlkjhj
opsdfapaop
sdfhjsdfgf
fhjhjpfdsd
fopafps
hhjlkjhj
hhjlkjhf
`.trim().split("\n"),`
uop
psd
fhf
dsp
fdp
fdp
ou
uop
psd
fhf
dsp
fdp
fdp
op
fhjjhjkhjhdffhjjhjlkhf
fhjjhjkhjhdffdpfdpop
fdpfdpop
`.trim().split("\n"),`
1231
1231
345
345
565431
565431
251
251
`.trim().split("\n"),`
1155665
4433221
5544332
5544332
1155665
4433221
`.trim().split("\n"),
]
let Music : NextPage = props => {
  let [chars,setChars] = useState([] as string[])
  let [char,setChar] = useState("")
  let [type,setType] = useState("bayinhe" as IType)
  let [lyricIndex,setLyricIndex] = useState(0)
  let [highlight,setHighlight] = useState({
    index : 0,
    highlight: ""
  })
  let fns = useCurrent({
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
    let map = {} as Record<string,{indown:boolean,source?:AudioBufferSourceNode}>
    let keydownfn = (e:KeyboardEvent) =>{
      if(e.key.length > 1 || map[e.key]?.indown){
        return 
      }else{
        map[e.key] = {indown:true}
        bufP.then(zones=>{
          map[e.key].source = playWave(ctx,zones,keymap[e.key.toLowerCase()] || 0)
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
          if(rest.charAt(0).toLowerCase() == e.key.toLowerCase()){
            setHighlight({
              index: highlight.index,
              highlight: highlight.highlight + e.key
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
        item?.source?.stop(ctx.currentTime + 0.5)
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
    w="full" h="100vh" position="absolute" top="0" left="0" opacity={.8}>
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
  return <VStack>
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
        colorScheme={bfn(0)}>换一首</Button>
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
        >琴</Button>
      </ButtonGroup>
      <MoonButton />
    </HStack>
    {lyricIndex == -1 ? freefn() : ramdomfn() }
    <Input
    position="fixed"
    zIndex="docked"
    w="100px"
    variant="filled"
    value="Click me"
    _focus={{opacity:.5}}
    top="20"
    left="sm"
    size="xs"
    opacity={1} display={["block","none"]} ></Input>
  </VStack>
}

export default Music