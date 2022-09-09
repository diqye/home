import { Textarea, TextareaProps } from "@chakra-ui/react"
import React, { useEffect, useRef } from "react"

type Overrite<A,B> = Omit<A,keyof B> & B
type FlexInputAutomaticallyProps = Overrite<TextareaProps,{
  onInput(value:string):void,
  value:string,
  rows?:1,
}>

let FlexInputAutomatically:React.FC<FlexInputAutomaticallyProps> = (props) => {
  let maxHeight = props.maxH || props.maxHeight || "52"
  let textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(()=>{
    textareaRef.current?.focus()
  },[])
  useEffect(()=>{
    let textarea = textareaRef.current
    if(textarea){
      textarea.style.setProperty("height", "auto")
      textarea.style.setProperty("height", textarea.scrollHeight + "px")
      let computedStyle = getComputedStyle(textarea)
      let maxH = computedStyle.getPropertyValue("max-height")
      let maxHNumber = parseInt(maxH)
      maxHNumber = isNaN(parseInt(maxH)) ? Infinity : maxHNumber
      if(maxHNumber > textarea.scrollHeight) {
        textarea.style.setProperty("overflow","hidden")
      } else {
        textarea.style.setProperty("overflow","auto")
      }
    }
  },[props.value])
  function onInput(e:React.FormEvent<HTMLTextAreaElement>){
      props.onInput(e.currentTarget.value)
  }
  return  <Textarea 
  {...props}
  placeholder={props.placeholder || '请输入...'}
  maxHeight={maxHeight}
  onInput={onInput}
  rows={1}
  ref={textareaRef}
  resize={"none"}
  ></Textarea>
}

export default FlexInputAutomatically