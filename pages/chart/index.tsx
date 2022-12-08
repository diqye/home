import { Box, Button, Checkbox, color, Heading, HStack, Input, Stack, Textarea } from "@chakra-ui/react"
import { NextPage } from "next"
import Chart, { ChartConfiguration, ChartData } from 'chart.js/auto';
import { ChangeEvent, useEffect, useRef, useState } from "react";
let dataAndLabel = [
  [1,"label1"],
  [2,"label2"],
  [1.5,"label3"],
  [4,"label4"],
  [-2,"label5"],
]
function getData():ChartData<"line">{
  return {
    datasets:[]
  }
}
let config = () => ({
  type: 'line',
  data: getData(),
  plugins:[],
  options: {
    normalized:true,
    parsing:{
      
    },
    elements:{
      line:{
        tension : 0.3
      } 
    },
    responsive: true,
    plugins: { 
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'JSON自由Chart'
      }
    }
  },
}) as ChartConfiguration<"line">
let colors = [
  ["#0f0","#0f04"],
  ["#00f","#00f4"],
  ["#0ff","#0ff4"],
] as const
function updateData(chart:Chart<"line">,xsp:[[number,string]] | [number],name:string,append=false,fill=true){
  let xs : [[number,string]] = xsp.length > 0 &&typeof xsp[0] == "number" ? xsp.map((a,i)=>[a,i+1 as any]) : xsp as any
  let color = colors[Math.trunc(Math.random()*colors.length)]
  if(append){
    let labels : string[] = chart.data.labels?.concat() as any || [] 
    let newLabels = xs.map(a=>a[1])
    newLabels.forEach(label=>{
      let inserted = false
      for(let i=0;i<labels.length;i++){
        if(label == labels[i]) {
          inserted = true
          break
        }else if(label < labels[i]){
          inserted = true
          labels = labels.slice(0,i).concat([label]).concat(labels.slice(i))
          break;
        }
      }
      if(inserted == false) labels.push(label)
    })
    let datasets = [] as any[]
    let newSet:any= {
      label:name,
      data:[],
      fill: fill?"origin":"none",
      spanGaps:true,
      borderColor:color[0],
      backgroundColor:color[1]
    }
    labels.forEach(label=>{
      let idx = -1
      if(chart.data.labels){
        idx = chart.data.labels.indexOf(label)
      }
      chart.data.datasets.forEach((dataset,i)=>{
        if(datasets[i] == null) {
          datasets[i] = {
            ...dataset,
            data:[]
          }
        }
        if(idx == -1){
          // let val = datasets[i].data[datasets[i].data.length-1] || null
          datasets[i].data.push(null)
        }else{
          datasets[i].data.push(dataset.data[idx])
        }
      })
      let nval = xs.find(a=>a[1] == label) || [null,""]
      newSet.data.push(nval[0])
    })
    datasets.unshift(newSet)
    console.log(datasets)
    chart.data.datasets = datasets
    chart.data.labels = labels
  }else{
    chart.data.datasets = [{
      data:xs.map(a=>a[0]),
      label: name,
      borderColor: "red",
      fill: fill?"origin":"none",
      spanGaps:true,
      backgroundColor:"#f004"
    }]
    chart.data.labels = xs.map(a=>a[1])
  }
}
const MyChart: NextPage = () => {
  let chartRef = useRef<HTMLCanvasElement>(null)
  let chartLineRef = useRef<Chart<"line",any>>()
  let [chartDataJSON,setJSON] = useState(JSON.stringify(dataAndLabel))
  let [titleCount,setTitleCount] = useState(1)
  let [name,setName] = useState("untitle1")
  let [needed,setNeeded] = useState(true)
  function dataChange(event:ChangeEvent<any>){
    setJSON(event.target.value)
  }
  function update(append=false){
   if(chartLineRef.current){
    updateData(chartLineRef.current,JSON.parse(chartDataJSON),name,append,needed)
    chartLineRef.current.update()
    setTitleCount(a=>a+1)
    setName("untitle"+(titleCount+1))
   }
  }
  useEffect(()=>{
    let ctx = chartRef.current?.getContext("2d")
    if(ctx == null) return
    let a = new Chart(ctx,config())
    updateData(a,JSON.parse(chartDataJSON),"demo")
    a.update()
    chartLineRef.current = a
    return ()=>{
      a.destroy()
    }
  },[])
  return <Stack p="10">
    <Heading>JSON转图表</Heading>
    <Box w="full">
      <canvas ref={chartRef} width="400" height="200"></canvas>
    </Box>
    <HStack>
      <Input value={name} onInput={e=>setName(e.currentTarget.value)}></Input>
      <Checkbox 
      flexBasis="130px"
      isChecked={needed}
      onChange={e=>setNeeded(e.target.checked)}
      >是否填充</Checkbox>
      <Button onClick={()=>update(false)}>更新</Button>
      <Button onClick={()=>update(true)}>添加</Button>
    </HStack>
    <Textarea w="full" h="200px" value={chartDataJSON} onChange={dataChange}></Textarea>
    <Box h="200px" bg="red"></Box>
  </Stack>
}
export default MyChart