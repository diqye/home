import type { NextPage } from 'next'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'


const Home : NextPage = () => {
  let [a,setA] = useState(8)
  let stateRef = useRef(a)
  function onClick(){
    setA(c=>c+1)
  }
  let afn = useCallback(()=>{
    console.log("callback",a)
  },[a])
  useEffect(()=>{
    setTimeout(()=>{
      afn()
    },3000)
  },[])
  return <div>
    <Link href={"/channel/home"}>
    /channel/home
    </Link>
    <div>{a}</div>
    <button onClick={onClick}>a+1</button>
  </div>
}
export default Home