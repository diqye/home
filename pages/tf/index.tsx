import { Heading, Stack } from "@chakra-ui/layout";
import { NextPage } from "next";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import {MnistData} from "./mnist.data"
import { Button,HStack,interactivity,Text } from "@chakra-ui/react";
declare var tfvis:any
let c = null as any
async function createMnist(){
  let mnistData = new MnistData()
  await mnistData.load()
  return mnistData
}
let mnistCache = null as any
async function run(){
  // return
  let mnistData
  if(mnistCache){
    mnistData = mnistCache
  }else{
   mnistData =  await createMnist()
  }
  let one = mnistData.nextTestBatch(4)
  // let one = mnistData.nextTrainBatch(4)
  let xs = one.xs as tf.Tensor2D
  let four = 3
  testCanvas(c,xs.gather([four,four-1,four-2,four-3]),one.labels.gather([four,four-1,four-2,four-3]))
}
function testCanvas(canvas:HTMLCanvasElement,mnistT:tf.Tensor,labels:any){
  let mnist = mnistT.dataSync<"float32">()
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  let oneSize = 28*28
  function drawImage(n:number,data:ImageData){
    for(let i=0;i<oneSize;i++){
      let pixi = i * 4
      data.data[pixi + 0] = mnist[oneSize*n+i] * 255
      data.data[pixi + 1] = mnist[oneSize*n+i] * 255
      data.data[pixi + 2] = mnist[oneSize*n+i] * 255
      data.data[pixi + 3] = 255
    }
    let [xn,yn] = [[0,0],[1,0],[0,1],[1,1]][n%4]
    ctx.putImageData(data,xn*28,yn*28)
  }
  drawImage(0,ctx.createImageData(28,28))
  drawImage(1,ctx.createImageData(28,28))
  drawImage(2,ctx.createImageData(28,28))
  drawImage(3,ctx.createImageData(28,28))

  function f(
    xs:tf.Tensor,
    w1:tf.Tensor,
    b1:tf.Tensor,
    w2:tf.Tensor,
    b2:tf.Tensor,
    w3:tf.Tensor,
    b3:tf.Tensor
    ):tf.Tensor{
    let h1 = w1.matMul(xs.transpose()).add(b1)
    let h2 = w2.matMul(h1.relu()).add(b2)
    let out = w3.matMul(h2.relu()).add(b3).transpose().softmax()
    return out
  }
  console.log("testing")
  let [w1,b1,w2,b2,w3,b3] = targ()
  let out = f(mnistT,w1,b1,w2,b2,w3,b3)
  console.log("result")
  let {indices} = out.topk(10)
  out.print()
  indices.print()
  console.log("lables")
  labels.print()
}

let targ_ : tf.Tensor<tf.Rank>[] = []
function targ(){
  if(targ_.length != 0) return targ_
  let shapes = [
    [784,784],
    [784,1],
    [392,784],
    [392,1],
    [10,392],
    [10,1]
  ] as const
  let args = takeArgs()
  targ_ = args.map((arg,i)=>{
    let a = new Float32Array(arg)
    return tf.tensor(a,shapes[i] as any)
  })
  return targ_
}
async function train(setMiniLoss:any){
  // 正态分布初始化权值，预期truncated,但是tf里没有这个函数
  // 最终找到了 tf.truncatedNormal
  // [b,784] -> [b,256] -> [b,128] -> [b,10]
  // 1 instead of b
  // [256,784][784,1]+[256,1]->[256,1].relu() 
  // [128,256][256,1]+[128,1]->[128,1].relu()
  // [10,128][128,1]+[10,1]->[10,1]t->[1,10]
  // let w1 = tf.truncatedNormal([256,784],0,0.1)
  // let b1 = tf.zeros([256,1])
  // let w2 = tf.truncatedNormal([128,256],0,0.1)
  // let b2 = tf.zeros([128,1])
  // let w3 = tf.truncatedNormal([10,128],0,0.1)
  // let b3 = tf.zeros([10,1])
  let w1 = tf.truncatedNormal([784,784],0,0.1)
  let b1 = tf.zeros([784,1])
  let w2 = tf.truncatedNormal([392,784],0,0.1)
  let b2 = tf.zeros([392,1])
  let w3 = tf.truncatedNormal([10,392],0,0.1)
  let b3 = tf.zeros([10,1])
  let learnRate = tf.tensor(0.002)
  let mnist = await createMnist()
  let [xs,labels] : [tf.Tensor,tf.Tensor]= [null as any,null as any]
  function f(w1:tf.Tensor,
    b1:tf.Tensor,
    w2:tf.Tensor,
    b2:tf.Tensor,
    w3:tf.Tensor,
    b3:tf.Tensor):tf.Scalar{
    let h1 = w1.matMul(xs.transpose()).add(b1)
    let h2 = w2.matMul(h1.relu()).add(b2)
    let out = w3.matMul(h2.relu()).add(b3).transpose().softmax()

    // loss
    // mse = mean(sum((y-out)^2))
    // let loss = labels.sub(out).square().mean<tf.Scalar>()
    let loss = labels.mul(out.log()).sum().mul(-1) as tf.Scalar
    return loss
  }
  let g = tf.grads(f)
  // let count = 200
  let count = 0
  let lastMin = 100000
  let lastArg = [] as tf.Tensor[]
  let countLimit = 2500
  while(count++ < countLimit){
    await new Promise<void>(ok=>setTimeout(ok))
    let batch = mnist.nextTrainBatch(128)
    if(count % 500 == 0){
      mnist.shuffledTrainIndex = 0
    }
    xs = batch.xs
    labels = batch.labels
    let loss = f(w1,b1,w2,b2,w3,b3).dataSync()[0] 
    let [w1_,b1_,w2_,b2_,w3_,b3_] = g([w1,b1,w2,b2,w3,b3])
    w1=w1.sub(w1_.mul(learnRate))
    w2=w2.sub(w2_.mul(learnRate))
    w3=w3.sub(w3_.mul(learnRate))
    b1=b1.sub(b1_.mul(learnRate))
    b2=b2.sub(b2_.mul(learnRate))
    b3=b3.sub(b3_.mul(learnRate))
    console.log("loss["+count+"]:"+loss)
    if(lastMin>loss){
      lastMin = loss
      setMiniLoss(lastMin)
      lastArg = [w1,b1,w2,b2,w3,b3]
    }
    if(count == countLimit){
      b3.print()
      console.log("b3",b3.dataSync<"float32">().buffer.byteLength)
       // new Float32Array(...) 奇怪的知识又增加了一些
      // 不重新new,buffer对不上
      // window.args = [w1,b1,w2,b2,w3,b3]
      console.log("save args and the minisize loss is ",lastMin)
      saveArgs(lastArg.map((arg)=>{
        return new Float32Array(arg.dataSync()).buffer
      }))
    }
  }
  
}
function saveArgs(args:ArrayBuffer[]){
  let argstr = args.map((arg,i)=>{
    console.log("byteLength",i,arg.byteLength)
    return Buffer.from(arg).toString("base64")
  })
  localStorage.setItem("args",JSON.stringify(argstr))
}
function takeArgs():ArrayBuffer[]{
  let argstr = JSON.parse(localStorage.getItem("args") || "") as string[]
  return argstr.map(str=>Buffer.from(str,"base64").buffer) as any
}
let TF : NextPage = props => {
  let ref = useRef<HTMLCanvasElement>(null)
  let refIntera = useRef<CanvasInteraction>()
  let [miniLoss,setMiniLoss] = useState(0)
  let [rekognition,setRekognition] = useState(0)
  useEffect(()=>{
    (window as any).tf =tf;
    (window as any).xx = {
      saveArgs,
      takeArgs
    }
    let intera : CanvasInteraction
    if(ref.current) {
      c = ref.current
      intera = new CanvasInteraction(ref.current).start()
      refIntera.current = intera
      // console.log("Strarting to run")
      // run()
      // train()
    }
    return ()=>{
      intera.destory()
    }
  },[])
  return <Stack>
    <Script 
    strategy="beforeInteractive"
    src="/tfjs-vis.umd.min.js">
      
    </Script>
    <Heading>Deep learning</Heading>
    <Text color="red">{miniLoss}</Text>
    <Button onClick={()=>train(setMiniLoss)} disabled={false}>To train</Button>
    <HStack>
      <Button onClick={()=>refIntera.current?.clear()}>To reset canvas</Button>
      <Button onClick={()=>rekognize(setRekognition)}>To rekognize</Button>
      <Text color="teal">{rekognition}</Text>
    </HStack>
    <canvas
    style={{border: "1px solid tomato"}}
    ref={ref} width="28" height="28"></canvas>
  </Stack>
}
class CanvasInteraction {
  private canvas : HTMLCanvasElement 
  private ctx : CanvasRenderingContext2D
  private canDraw = false
  private bind1 = null as any
  private bind2 = null as any
  private bind3 = null as any
  constructor(canvas:HTMLCanvasElement){
    this.canvas = canvas
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    this.bind1 = (e:MouseEvent) => this.onMousedown(e)
    this.bind2 = (e:MouseEvent) => this.onMouseup(e)
    this.bind3 = (e:MouseEvent) => this.onMousemove(e)
  }
  start(){
    this.canvas.addEventListener("mousedown",this.bind1)
    this.canvas.addEventListener("mouseup",this.bind2)
    this.canvas.addEventListener("mousemove",this.bind3)
    this.clear()
    return this
  }
  clear(){
    this.ctx.beginPath()
    this.ctx.fillStyle="#000"
    this.ctx.rect(0,0,this.canvas.width,this.canvas.height)
    this.ctx.fill()
  }
  destory(){
    this.canvas.removeEventListener("mousedown",this.bind1)
    this.canvas.removeEventListener("mouseup",this.bind2)
    this.canvas.removeEventListener("mousemove",this.bind3)
  }
  private onMousemove(e:MouseEvent){
    if(this.canDraw==false)return
    let width = this.canvas.offsetWidth - 2 
    let height = this.canvas.offsetHeight - 2
    let x = e.offsetX / width * this.canvas.width
    let y = e.offsetY / height * this.canvas.height
    this.ctx.fillStyle="#fff"
    this.ctx.beginPath()
    this.ctx.arc(x,y,1,0,2*Math.PI)
    // this.ctx.rect(x,y,1,1)
    this.ctx.fill()
  }
  private onMousedown(e:MouseEvent){
    this.canDraw=true
  }
  private onMouseup(e:MouseEvent){
    this.canDraw=false
  }
}
function rekognize(setFn:any){
  let ctx = c.getContext("2d") as CanvasRenderingContext2D
  let imageData = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height)
  let length = imageData.data.length / 4
  let f32 = new Float32Array(length)
  for(let i=0;i<length;i++){
    let start = i * 4
    let gi = imageData.data[start]
    f32[i] = gi/255
  }
  let xs = tf.tensor(f32,[1,28*28])
  function f(
    xs:tf.Tensor,
    w1:tf.Tensor,
    b1:tf.Tensor,
    w2:tf.Tensor,
    b2:tf.Tensor,
    w3:tf.Tensor,
    b3:tf.Tensor
    ):tf.Tensor{
    let h1 = w1.matMul(xs.transpose()).add(b1)
    let h2 = w2.matMul(h1.relu()).add(b2)
    let out = w3.matMul(h2.relu()).add(b3).transpose().softmax()
    return out
  }
  console.log("rekognizing")
  let [w1,b1,w2,b2,w3,b3] = targ()
  let out = f(xs,w1,b1,w2,b2,w3,b3)
  out.reshape([10]).print()
  let {indices} = out.topk(1)
  indices.reshape([1]).print()
  setFn(indices.dataSync()[0])
}
export default TF