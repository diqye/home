import { FC, useEffect, useRef } from "react"

type WaveProps = {
    stream?: MediaStream
}
let TimeDomainWave : FC<WaveProps> = props => {
    let ref = useRef<HTMLCanvasElement>(null)
    useEffect(()=>{
        if(ref.current == null) return
        if(props.stream == null) return
        let ctx = new AudioContext()
        let sourceNode = ctx.createMediaStreamSource(props.stream)
        
        let analyse = ctx.createAnalyser()
        analyse.fftSize = 512
        sourceNode.connect(analyse)
        let fArr = new Uint8Array(analyse.fftSize)
        let c = ref.current.getContext("2d")
        if(c == null) return
        let gradient = c.createLinearGradient(100,0,900,0)
        gradient.addColorStop(0,"green")
        gradient.addColorStop(0.25,"cyan")
        gradient.addColorStop(0.75,"red")
        gradient.addColorStop(1,"purple")
        draw(analyse,c,fArr,gradient)
        return ()=>{
            ctx.close()
        }
    },[props.stream])
    return <canvas ref={ref} width={1000} height={625} style={{width:"100%",position:"absolute",top:"50%",left:0,pointerEvents:"none"}}></canvas>
}
function draw(analyse:AnalyserNode,ctx:CanvasRenderingContext2D,data:Uint8Array,gradient:CanvasGradient){
    analyse.getByteTimeDomainData(data)
    ctx.clearRect(0,0,1000,625)
    let path = new Path2D()
    data.forEach((v,i)=>{
        let x = i*2;
        let y = v/128*625/2
        path.lineTo(x,y)
    })
    ctx.strokeStyle = gradient
    ctx.lineWidth = 20
    ctx.stroke(path)
    requestAnimationFrame(()=>draw(analyse,ctx,data,gradient))
}
export default TimeDomainWave