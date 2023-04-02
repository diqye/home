import { Button,ButtonProps,ComponentWithAs, Box, Center, Text,Textarea, IconButton, Badge } from "@chakra-ui/react";
import Head from 'next/head'
import { NextPage } from "next";
import FlexInputAutomatically from "@c/FlexInputAutomatically";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowBackIcon, ArrowForwardIcon, ArrowUpIcon, BellIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
declare var chrome :any
let SpeakButton = Button as ComponentWithAs<"button",ButtonProps & {speak:number}>
type IntensiveExerciseProps = {
    exerciseList : string[],
    onChangeExercise: (i:number,exerciseChanged:string) => void,
    back:()=>void
}
let IntensiveExercise : React.FC<IntensiveExerciseProps> = props => {
    let [index,setIndex] = useState(0)
    let [viewOn,setViewOn] = useState(true)
    useMemo(()=>{
        setIndex(0)
    },[props.exerciseList.length])
    let content = props.exerciseList[index]
    function onContentInput(val:string){
        props.onChangeExercise(index,val)
    }
    function onPrevious(){
        setIndex(i=>i-1)
    }
    function onNext(){
        setIndex(i=>i+1)
    }
    function viewOnVisible(){
        return viewOn ? "visible" : "hidden"
    }
    function viewOffVisible(){
        return viewOn ? "hidden" : "visible"
    }
    let vonv = viewOnVisible() as "visible" | "hidden"
    let voffv = viewOffVisible() as "visible" | "hidden"
    // let stopPropagation:KeyboardEventHandler<HTMLTextAreaElement> = e =>{
    //     if(!e.ctrlKey || !e.shiftKey){
    //         e.stopPropagation()
    //     }
    // }
    useEffect(()=>{
        window.addEventListener("keyup",e=>{
             if(e.target instanceof HTMLTextAreaElement){
                return 
            }
            if(e.target instanceof HTMLInputElement){
                return 
            }
            let key = e.key.toLocaleLowerCase()
            let ele = document.querySelector(`[accessKey='${key}']`)
            ele?.dispatchEvent(new MouseEvent("click",{bubbles:true}))
        })
        return ()=>{
            // Removing event of keyup
        }
    },[])
    return <>
        <Center padding={2} gap={2}>
            <IconButton icon={<ArrowBackIcon />} aria-label={"Previous"}
            accessKey="["
            colorScheme="teal"
            visibility={vonv}
            isDisabled={index == 0}
            onClick={onPrevious}
            />
            <SpeakButton visibility={vonv} speak={1.5} accessKey="i">1.5x</SpeakButton>
            <SpeakButton visibility={vonv} speak={1} accessKey="o">x</SpeakButton>
            <SpeakButton speak={0.5} visibility={vonv} accessKey="p">0.5x</SpeakButton>
            <IconButton icon={<ArrowForwardIcon />} aria-label={"Next"}
            colorScheme="teal"
            visibility={vonv}
            isDisabled={index == props.exerciseList.length-1}
            accessKey="]"
            onClick={onNext} />
            <Badge minW="3em" fontSize="2xl" textAlign="center">{index + 1 + '/' + props.exerciseList.length}</Badge>
            <IconButton icon={<ArrowUpIcon />}
            aria-label={"Back"}
            visibility={vonv}
            accessKey="-"
            onClick={props.back} />
            {
                viewOn ?  <IconButton icon={<ViewOffIcon />} aria-label={"View on"} onClick={()=>setViewOn(false)} />
                :  <IconButton  icon={<ViewIcon />} aria-label={"View off"} onClick={()=>setViewOn(true)} />

            }
        </Center>
        <Center padding="2">
            <FlexInputAutomatically
            border="none"
            placeholder=" "
            _focusVisible ={{border:"none"}}
            value={content}
            // onKeyUp={stopPropagation}
            maxH={Infinity}
            onInput={onContentInput}
            id="speak-content"  fontSize="5em" textAlign="center"></FlexInputAutomatically>
        </Center>
    </>
}
type InitialExercisesProps = {
    end: (exercises:string[])=>void,
    message : {
        version: number,
        key: "Reset",
        val: string
    }
}
function splitWords(text:string):string[]{
    return text.match(/[\u00ff-\uffff]|\S+/g) || [] as any
}
let InitialExercises : React.FC<InitialExercisesProps> = props => {
    let [content,setContent] = useState("Load")
    useEffect(()=>{
        if(props.message.key == "Reset" ){
            setContent(props.message.val)
        }
    },[props.message])
    // Saving and loading automatically
    useEffect(()=>{
        let timmerSavedAutomatically = 0 as any as NodeJS.Timeout
        if(content == "Load"){
            setContent(localStorage.getItem("content") || "")
        }else{
            clearTimeout(timmerSavedAutomatically)
            timmerSavedAutomatically = setTimeout(()=>{
                localStorage.setItem("content",content)
            },3000)
        }
    },[content])
    function onContentInput(target:FormEvent<HTMLTextAreaElement>){
        setContent(target.currentTarget.value) 
        clearTimeout
    }
    function onStart(){
        let list = content.split("\n")
        props.end(list)
    }
    return <>
        <Center padding={2} position="relative">
            <Textarea
            placeholder="Please enter content..."
            value={content} onInput={onContentInput} rows={20}></Textarea>
            <Badge
            zIndex={10}
            colorScheme="gray" display="block" position="absolute" right="20px" bottom="20px">{splitWords(content).length} words</Badge>
        </Center>
        <Center>
            <Button
            disabled={content == ""}
            onClick={()=>onStart()}
            colorScheme="blue"
            >Start intensive exercise</Button>
        </Center>
    </>
}
let Words : NextPage = props =>{
    let [exerciseList,setExerciseList] = useState([] as string[])
    let [msg,setMsg] = useState<InitialExercisesProps["message"]>({key:"Reset",version:0,val:""})
    let end = (list:string[]) => {
        setExerciseList(list)
    }
    function onChangeExercise(i:number,line:string){
        setExerciseList(exerciseList.map((v,idx)=>idx==i?line:v))
    }
    function back(){
        setExerciseList([])
        setMsg({
            key:"Reset",
            val: exerciseList.join("\n"),
            version: Date.now()
        })
    }
    return <>
    <Head>
        <title>Intensive exercise</title>
    </Head>
    <Box hidden={exerciseList.length != 0}>
        <InitialExercises end={end} message={msg}/>
    </Box>
    <Box hidden={exerciseList.length == 0}>
        <IntensiveExercise exerciseList={exerciseList} onChangeExercise={onChangeExercise} back={back}/>
    </Box>
    </>
}

export default Words