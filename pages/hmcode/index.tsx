import { Box, Button, Stack, Text, Textarea, useClipboard, useToast} from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import styles  from "../../styles/hcode.module.css"
let backgroundVideo = "/big/MapleLeaf.mp4"
let rate = 736/414
let b64Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
let codes = [
    "😻", "🥰", "🩵", "🩶", "🩷", "🌈", "💓", "💔", "💕", "💖",
    "💗", "💘", "💙", "💛", "💜", "💞", "🍓", "😍", "🤍", "🤎",
    "😘", "💌", "🫶", "💝", "🥶","🪵" ,"🐉", "😥", "🫥",  "🐲",
    "💒","♑️", "♌️","♏️", "♎️","m","禾","木","1",
    '♠', '♣', '♥', '♦', '♤', '❤', '❥', '♡', '❣', 'ღ',
    "6", "9", "0","O", "o", ".", "ɒ", "Ά", "ἆ", "ἇ",
    "β", "ϐ", "༁", "༊", "ƛ","7","h"
]

function restBit(n:number){
    return n == 0 ? 0b00000000
    : n == 1 ? 0b00000001
    : n == 2 ? 0b00000011
    : n == 3 ? 0b00000111
    : n == 4 ? 0b00001111
    : n == 5 ? 0b00011111
    : n == 6 ? 0b00111111
    : n == 7 ? 0b01111111
    : 0b11111111
}
function eightToSix(buf:Uint8Array,start=8) : [number,number,Uint8Array]{
    if(buf.length == 0) return [0,0,new Uint8Array()]
    let head = buf.at(0) || 0
    if(start > 6){
        let leftLen = start -6
        let v = head >> leftLen
        buf.set([head & restBit(leftLen)])
        return [v,leftLen,buf]
    }else if(start == 6){
        let v = head
        return [v,8,buf.slice(1)]
    }else{
        let nextNeededLen = 6 - start
        let nextLen = 8 - nextNeededLen
        if(buf.length > 1){
            let nextV = buf.at(1) || 0
            let v = (head << nextNeededLen) + (nextV >> nextLen)
            let newBuf = buf.slice(1)
            newBuf.set([nextV & restBit(nextNeededLen)])
            return [v,nextLen,newBuf]
        }else{
            // 11111100 -> 111111,001000
            return [head << (6-start),-1,buf.slice(1)]
        }
    }
}
function testEightToSix(){
    let buf = new Uint8Array([0b10110111,0b10110111])
    let [v,l,restBuf] = eightToSix(buf)
    console.assert(v == 0b101101,"v == 0b10110111")
    console.assert(l == 2,"First length is wrong")
    console.assert(restBuf.at(0) == 0b11)
    let [v2,l2,restBuf2] = eightToSix(restBuf,l)
    console.assert(v2 == 0b111011,"v == 0b111011")
    console.assert(l2 == 4,"First length is wrong")
    let [v3,l3,_] = eightToSix(restBuf2,l2)
    console.assert(v3 == 0b011100,"v == 0b111000")
    console.assert(l3 == -1,"First length is wrong")
    let blike = [] as number[]
    let e1 = sixToEight(v,blike)
    console.assert(blike[0] == 0b101101)
    let e2 = sixToEight(v2,blike,e1)
    console.assert(blike[0] == 0b10110111)
    console.assert(blike[1] == 0b1011)
    console.log(blike.map(a=>a.toString(2)).join(","))
    let e3 = sixToEight(v3,blike,e2)
    console.log(e3)
    blike[blike.length-1] = blike[blike.length-1] << (8-e3)
    if(l3 == -1 && blike[blike.length-1] == 0){
        blike.pop()
    }
    console.log(blike.map(a=>a.toString(2)))

}
function sixToEight(sixV:number,buf:number[],lastLen=8){
    let e = buf.length - 1
    if(lastLen == 8){
        buf.push(sixV)
        return 6
    }else{
        let n = 8 - lastLen
        buf[e] = (buf[e] << n) + (sixV >> (6-n))
        if(6-n <= 0){
            return 8
        }else{
            buf.push(sixV & restBit(6-n))
            return 6-n
        }
    }
}
function stringToHmcode(str:string){
    let b64 = Buffer.from(str,"utf-8").toString("base64")
    return b64.split("").map(a=>{
        return codes[b64Str.indexOf(a)]
    }).join("")
}
function hmcodeToString(code:string){
   let b64s = [] as string[]
   while(true){
    let [idx,rest] = parse(code)
    code = rest
    if(idx == -1){
        break
    }
    b64s.push(b64Str.charAt(idx))
   }
   return Buffer.from(b64s.join(""),"base64").toString("utf-8")
}
function parse(code:string):[number,string]{
    for(let i=0;i<codes.length;i++){
        let token = codes[i]
        if(code.startsWith(token)){
            return [i,code.slice(token.length)]
        }
    }
    return [-1,""]
}
export default function HCode(){
    let [top,setTop] = useState(0)
    useEffect(()=>{
        let width = window.innerWidth
        setTop(width*rate)
        //**************** */
        // window.hts = hmcodeToString
        // for(let item of codes){
        //     console.log(item,item.length,item.split("").map(a=>a.charCodeAt(0)))
        //     if(codes.filter(a=>a == item).length != 1){
        //         console.log("reapeat",item)
        //     }
        // }
        //**************** */
    },[])
    let [text,setText] = useState("")
    let [publicText,setPublicText] = useState("")
    let { onCopy, value, setValue, hasCopied } = useClipboard("")
    useEffect(()=>{
        let [flag,_] = parse(text)
        if(flag == -1){
            setValue(stringToHmcode(text))
        }else{
            translateCode()
        }
    },[text])
    function translateCode(){
        let [flag,_] = parse(text)
        if(flag == -1){
            onCopy()
        }else{
            let publict = hmcodeToString(text)
            setPublicText(publict)
        }
        setText("")
    }
    let toast = useToast()
    useEffect(()=>{
        if(hasCopied){
            toast({
                title: "已复制",
                position: "top",
                duration: 5000
            })
        }
    },[hasCopied])
    useEffect(()=>{
        let n = 0
        if(publicText != ""){
            n = setTimeout(()=>{
                setPublicText("")
            },1000*30) as any
        }
        return ()=>{
            clearTimeout(n)
        }
    },[publicText])
    return <>
        <Head>
            <title>hmcode</title>
        </Head>
        <Stack className={styles.main} minH="100vh" position="relative">
            <video muted autoPlay={true} loop>
                <source src={backgroundVideo}></source>
            </video>
            <Box
            visibility={publicText == "" ? "hidden" : "visible"}
            position="absolute"
            top="0px"
            maxH="420px"
            whiteSpace="pre-wrap"
            overflow={"auto"}
            w="full"
            left="0px"
            p="8px"
            backgroundColor="rgba(10,10,10,0.6)">
                <Text color="whiteAlpha.900">{publicText}</Text>
            </Box>
            <Stack 
            spacing={0}
            position="absolute"
            w="full" 
            top={(top - 200) + "px"} 
            backgroundColor="rgba(10,10,10,0.3)">
                <Textarea 
                value={text}
                onInput={e=>setText(e.currentTarget.value)}
                color="whiteAlpha.900" w="full" h="200px" mt="-8px" border="Background" />
                <Button 
                isDisabled={text == ""}
                onClick={translateCode}
                position="absolute"
                right="0"
                bottom="0"
                zIndex={10}
                colorScheme="red">...MD...</Button>
            </Stack>
        </Stack>
    </>
    
}