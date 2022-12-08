import { createWave } from "./music"
import { Doremi, getMusicalKey, notes } from "./notes"

export default class Autoplay {
  private gain : GainNode
  private buff = [] as any []
  private actx : AudioContext
  private  c1 = 6 // 钢琴中央c组
  constructor(ctx:AudioContext,gain:GainNode){
    this.actx = ctx
    this.gain = gain
  }
  setBuffer(buff:any []){
    this.buff = buff
  }
  // 每分钟n拍，默认60
  private mkPa(n=60,fromTime=0){ 
    let t = fromTime == 0 ? this.actx.currentTime : fromTime
    let pa = (v:number=1) => {
      let a = t
      t+=v * (60/n)
      return [a,t] as const
    }
    return pa
  }
  public playNotes(paN=60,major:typeof notes[number],doremi:[number,Doremi|0,number][],startTime=0){
    let pa = this.mkPa(paN,startTime)
    let endTime = 0
    doremi.forEach(a=>{
      let times = pa(a[2])
      endTime = times[1]
      if(a[1]!=0){
        this.doremi(a[1],this.c1 + a[0],times,major)
      }
    })
    return endTime
  }
  public doremi(d:Doremi,scale:number,times:readonly [number,number],major:any="C"){
    let a = createWave(this.actx,this.buff,getMusicalKey(scale,major,d)[0],times[0])
    a.audioNode.connect(this.gain).connect(this.actx.destination)
    a.source.start(times[0])
    a.source.stop(times[1])
    return a
  }
}



export let canon : any [] = trans([
  82,
  [
    [31002,21002,11002,70902,60902,50902,60902,70902],
    [10902,50802,60802,30802,40802,50802,40802,50802]
  ],[
    [31102,21102,11102,71002,61002,51002,61002,71002],
    [51002,51002,31002,31002,11002,11002,11002,21002],
    [10902,50802,60802,30802,40802,10902,40802,50802]
  ],
  72,
  [ // (9)
    [31102,21102,1001,1001,61002,50102],
    [51002,51004,41004,11102,71004,51004,61002,51004,31004,41002,21004,41004],
    [10908,50908,11008,31008,70808,20908,50908,70908,60808,30908,60908,11008,30808,30908,50908,70908,40808,10908,40908,60908,10908,30908,50908,11008,40808,10908,40908,60908,50808,20908,50908,70908]
  ],[ // (13)
    [11108,71008,11108,31008,51004,71004,11104,31104,51108,31108,51108,61108,41108,31108,21108,41108,31108,21108,11108,71008,61008,41008,11104,71008,51008,11108,71008],
    [10908,30908,50908,11008,50808,20908,50908,70908,60808,30908,60908,11008,30808,30908,50908,70908,40808,10908,40908,60908,10908,30908,50908,11008,40808,10908,40908,60908,50808,20908,50908,70908]
  ],[// (17) 
    [11108,71008,11108,31008,51004,71004,11104,31108,11108,51108,31108,51108,61108,4,3,2,4,3,2,1,71008,6,5,41004,11104,51016,71008,21108,51008] ,
    [10908,3,5,11008,50808,20908,5,7,60808,30908,6,11008,30808,30908,50908,7,40808,10908,4,6,1,3,5,11008,40808,10908,4,6,50808,20908,5,7]
  ],[// (21)
    [1001,1001,1001,61004],
    [31104,51016,31116,2,1,2,21104,31116,4,3,2,3,11104,11116,11108,71016,11116,71008,51016,3,31008,51008,61004,71008,11108,51004,31008,51008,41004,41016,6,11116,11106,71016,7,11116,2,51016],
    [10908,3,5,11008,70808,20908,5,7,60808,30908,6,11008,30808,30908,5,7,40808,10908,4,6,1,3,5,11008,40808,10908,4,6,50808,20908,5,7]
  ], [
    [1001,1001,1001,61004],
    [31104,51016,31116,2,1,2,21104,31116,4,3,2,3,11104,11116,11108,71016,11116,71008,51016,3,31008,51008,61004,71008,11108,51004,31008,5,41004,41016,6,11116,11104,71016,7,11116,2,51016],
    [10908,3,5,11008,50808,20908,5,7,60808,30908,6,11008,30808,30908,50908,70908,40808,10908,4,6,1,3,5,11008,40808,10908,4,6,50808,20908,5,7]
  ],[
    // 后面还有一半，由于音符太多，输入太累就没输入了!
  ]
])

function trans(xs:any[]){
  return xs.map(a=>{
    if(typeof a == "number"){
      return a
    }else{
      let lastLevel = 10
      let lastPa = 4
      return a.map((bs:any[])=>{
        return bs.map(b=>{
          if(b < 10){
            return [lastLevel - 10,b,4/lastPa]
          }
          let doremi = Math.trunc(b / 10000)
          let level = Math.trunc(b % 10000 / 100)
          let pa = b % 100
          lastLevel = level
          lastPa = pa
          return [level - 10,doremi,4/pa]
        }) 
      })
    }
  })
}