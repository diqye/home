import { ThemeComponentProps, useColorModeValue } from "@chakra-ui/react"
import { useRef } from "react"


export function useCurrent<T extends Record<string,any>>(fns:T):T{
  let ref = useRef(fns)
  for(let key in fns){
    ref.current[key] = fns[key]
  }
  return ref.current
}
let detectedMobile = false
let detectedR = false
export function isMobile(ua?:string) {
  if(detectedMobile){
    return detectedR
  }
  var userAgentInfo = ua?ua:navigator.userAgent;
  // 由于iPad会伪装成电脑的UA，所以判断不出来
  var mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad","iPod"];
  //根据userAgent判断是否是手机
  for (var v = 0; v < mobileAgents.length; v++) {
      if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
        return true
      }
  }
  if(ua) return false
  if(mobileAgents.includes("Mac")){
    return "ontouchend" in document
  }else{
    return false
  }
}

type ColorScheme = ThemeComponentProps["colorScheme"]
export function useCS(color:ColorScheme){
  let [light,dark] = cmv(color)
  return useColorModeValue(light,dark)
}
export function cmv(color:ColorScheme):[string,string]{
  let light,dark
  if(color == "gray"){
    light = "gray"
    dark = "whiteAlpha.900"
  }else{
    light = color + ".600"
    dark = color + ".200"
  }
  return [light,dark]
}


export type MyDataView = ReturnType<typeof createMyDataView>
export function createMyDataView(buf:ArrayBuffer){
  let offset = 0
  let dv = new DataView(buf)
  let byteMap = {
    "uint8":[1,()=>dv.getUint8(offset)],
    "int8":[1,()=>dv.getInt8(offset)],
    "int16":[2,()=>dv.getInt16(offset,true)],
    "float32":[4,()=>dv.getFloat32(offset,true)]
  } as const
  type Key =  keyof typeof byteMap
  type GetR<a extends Key> = ReturnType<Pick<typeof byteMap,a>[a][1]>
  let result =  {
    skip(n:number){
      offset += n 
    },
    isEnd(){
      return offset >= buf.byteLength
    },
    tryGet<a extends Key>(type:a):GetR<a>{
      let [_,get1] = byteMap[type]
      let r = get1()
      return r as any
    },
    get<a extends Key>(type:a):GetR<a>{
      let [n,get1] = byteMap[type]
      let r = get1()
      result.skip(n)
      return r as any
    }
  }

  return result
}