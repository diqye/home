import { Box, Button, Stack, Text, Textarea, useClipboard, useToast,chakra, HStack, PinInput, PinInputField, BoxProps} from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
let backgroundVideo = "https://devstatic.douyuxingchen.com/hash/diqye/c95ad0f10409c2088fa434b1de0f036c76a723da.mp4"
let rate = 736/414
let b64Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
/*

*/
let codes = [
    "❤️‍🔥", "🖕🏻", "🫶🏻", "😍","💋", "💍", "🐶", "🦋", "🥀", "💐", "🐷", "🌷",
    "🪷", "⭐️", "❄️", "🫧", "🍓", "🥰",  "🦌", "🫶",
    "🥑", "🧀", "🍔", "🍵", "🧊","🎀" ,"🎉", "🎐", "💕",
    "💗","💖", "💟", "✨","糖", "醋","鱼","三","狠","汤",
    '振', '龙', '夏', '秦', '静', '怡', '嘟', '阿', '巴', '摩',
    "羯", "座", "想","我", "你", "T", "C", "Y", "t", "c",
    "y", "s", "h", "g", "S","H","G"
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
function checkParse(text:string,n=4):boolean{
    if(n==0) return true
    if(text.length == 0 ) return true
   let [r,rest]  = parse(text)
   if(r == -1) return false
   else return checkParse(rest,n-1)
}
 function Ecode(){
    let [top,setTop] = useState(0)
    useEffect(()=>{
        let width = Math.min(520,window.innerWidth)
        setTop(width*rate)
        // document.body.style.background = "#FFE4C4"
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
        if(text.length > 5 && checkParse(text)){
            translateCode()
        }else{
            setValue(stringToHmcode(text))
        }
    },[text])
    function translateCode(){
        if(checkParse(text) == false){
            onCopy()
        }else{
            let publict = hmcodeToString(text)
            setPublicText(publict)
            document.querySelector("textarea")?.blur()
            window.scrollTo(0,0)
        }
        setText("")
    }
    let toast = useToast()
    useEffect(()=>{
        if(hasCopied){
            toast({
                title: "已加糖了呃～～",
                position: "top",
                duration: 3000
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
    let [muted,setMuted] = useState(true)
    return <>
        <Stack maxW="520px" margin="auto" position="relative">
            <chakra.video muted={muted} autoPlay={true} loop playsInline boxShadow="0 0 100px 25px #000">
                <source src={backgroundVideo}></source>
            </chakra.video>
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
            >
                <Volume 
                onClick={()=>setMuted(!muted)}
                muted={muted} position="absolute" right={1} top={1} zIndex={11} />
                <Textarea 
                value={text}
                onInput={e=>setText(e.currentTarget.value)}
                backgroundColor="rgba(10,10,10,0.3)"
                color="whiteAlpha.900" w="full" h="200px" mt="-8px" border="Background" />
                <Button 
                isDisabled={text == ""}
                onClick={translateCode}
                position="absolute"
                right="0"
                bottom="0"
                zIndex={10}
                colorScheme="red">加糖</Button>
            </Stack>
        </Stack>
    </>
    
}
type VolumeProps = BoxProps & {
    muted : boolean
}
function Volume(props:VolumeProps ){
    let mutedSvg = <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5001 11.9998C15.5001 12.5317 15.4647 13.4879 15.4128 14.6052C15.2726 17.6226 15.2025 19.1313 14.2798 19.7797C14.1029 19.9041 13.9048 20.0049 13.7001 20.0747C12.7327 20.4048 11.5976 19.747 9.50009 18.3725M7.01629 17.0417C6.76828 16.9998 6.51225 16.9998 6.00018 16.9998C4.62626 16.9998 3.9393 16.9998 3.33997 16.7225C2.79239 16.4692 2.24482 15.9539 1.95863 15.4228C1.6454 14.8414 1.60856 14.237 1.53488 13.0282C1.52396 12.849 1.51525 12.6722 1.50928 12.4998M1.95863 8.57679C2.24482 8.04563 2.79239 7.53042 3.33997 7.27707C3.9393 6.99979 4.62626 6.99979 6.00018 6.99979C6.51225 6.99979 6.76828 6.99979 7.01629 6.95791C7.26147 6.9165 7.50056 6.84478 7.72804 6.74438C7.95815 6.64283 8.1719 6.50189 8.59941 6.22002L8.81835 6.07566C11.3613 4.39898 12.6328 3.56063 13.7001 3.92487C13.9048 3.9947 14.1029 4.09551 14.2798 4.21984C15.1151 4.80685 15.2517 6.09882 15.3741 8.57679" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M20 18C20 18 21.5 16.2 21.5 12C21.5 9.56658 20.9965 7.93882 20.5729 7" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M18 15C18 15 18.5 14.1 18.5 12C18.5 11.1381 18.4158 10.4784 18.3165 10" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M22 2L2 22" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    let unmutedSvg = <svg width="40px" height="40x" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6C20 6 21.5 7.8 21.5 12C21.5 16.2 20 18 20 18" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M18 9C18 9 18.5 9.9 18.5 12C18.5 14.1 18 15 18 15" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M1.95863 8.57679C2.24482 8.04563 2.79239 7.53042 3.33997 7.27707C3.9393 6.99979 4.62626 6.99979 6.00018 6.99979C6.51225 6.99979 6.76828 6.99979 7.01629 6.95791C7.26147 6.9165 7.50056 6.84478 7.72804 6.74438C7.95815 6.64283 8.1719 6.50189 8.59941 6.22002L8.81835 6.07566C11.3613 4.39898 12.6328 3.56063 13.7001 3.92487C13.9048 3.9947 14.1029 4.09551 14.2798 4.21984C15.2025 4.86829 15.2726 6.37699 15.4128 9.3944C15.4647 10.5117 15.5001 11.4679 15.5001 11.9998C15.5001 12.5317 15.4647 13.4879 15.4128 14.6052C15.2726 17.6226 15.2025 19.1313 14.2798 19.7797C14.1029 19.9041 13.9048 20.0049 13.7001 20.0747C12.6328 20.4389 11.3613 19.6006 8.81834 17.9239L8.59941 17.7796C8.1719 17.4977 7.95815 17.3567 7.72804 17.2552C7.50056 17.1548 7.26147 17.0831 7.01629 17.0417C6.76828 16.9998 6.51225 16.9998 6.00018 16.9998C4.62626 16.9998 3.9393 16.9998 3.33997 16.7225C2.79239 16.4692 2.24482 15.9539 1.95863 15.4228C1.6454 14.8414 1.60856 14.237 1.53488 13.0282C1.52396 12.849 1.51525 12.6722 1.50928 12.4998" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    return <Box cursor={"pointer"} {...props}>{props.muted ? mutedSvg :  unmutedSvg} </Box>
}

type CheckProps = {
    onPass : () => void 
}
function Check(props: CheckProps){
    let [invalid,setInvalid] = useState(false)
    function onComplete(str:String){
        if(str == "1111"){
            props.onPass()
        }else{
            setInvalid(true)
        }
    }
    return <HStack justifyContent={"center"} w="full" position={"absolute"} top="200px">
    <PinInput size={"lg"} mask isInvalid={invalid} onComplete={onComplete}>
      <PinInputField />
      <PinInputField />
      <PinInputField />
      <PinInputField />
    </PinInput>
  </HStack>
}

export default function Main(){
    let [isPass,setIsPass] = useState(false)
    useEffect(()=>{
        if(localStorage.getItem("tangcuyu") == "sanhentang") setIsPass(true)
    },[])
    function onPass(){
        localStorage.setItem("tangcuyu","sanhentang")
        setIsPass(true)
    }
    return <>
        <Head>
            <title>I</title>
        </Head>
        {isPass ? <Ecode /> : <Check onPass={onPass}/>}
    </>
}