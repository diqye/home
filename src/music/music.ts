
export let actx = typeof window == "undefined" ? null as any as AudioContext : new AudioContext() 
export type IType = "bayinhe" | "dagangqin" | "guzheng" | "other" | "woodblock"
export async function loadMusicBox(ctx=actx,type:IType="bayinhe"){
  let {default:files} = await import("src/music/0100_FluidR3_GM_sf2_file.js")
  if(type == "dagangqin"){
    let {default:files1} = await import("src/music/dagangqin.js")
    files = files1
  }else if(type == "other"){
    // let {default:files1} = await import("src/music/0090_JCLive_sf2_file.js")
    // files = files1
    // 振荡器走这里
    return []
  }else if(type == "guzheng"){
    let {default:files1} = await import("src/music/guzheng.js")
    files = files1
  }else if(type == "woodblock"){
    let {default:files1} = await import("src/music/woodblocks.js")
    files = files1
  }else{
    // 默认是八音盒
    void 0
  }
  type Zone = Omit<typeof files["zones"][0],"file"> & {
    buffer : AudioBuffer,
    file? : string
  }
  let zones = files.zones as Zone []
  zones.forEach(async zone=>{
    if(zone.buffer){
      return
    }
    let buf = Buffer.from(zone.file as string,"base64")
    let audioBuf = await ctx.decodeAudioData(buf.buffer)
    zone.buffer = audioBuf
    delete zone.file
  })
  return zones
}
type Zone = Awaited<ReturnType<typeof loadMusicBox>>[0]

export function createWave(ctx=actx,zones:Zone[],key:number,startTime?:number){
  
  let zone = zones.find(a=>{
    return a.keyRangeLow <= key && a.keyRangeHigh + 1 >= key
  })
  if(zone){
    let tune = zone.originalPitch - 100.0 * zone.coarseTune - zone.fineTune
    let playbackrate = 1.0 * Math.pow(2,(100*key - tune) / 1200.0) // + zone.anchor
    let t  = startTime?startTime:ctx.currentTime
    let source = ctx.createBufferSource()
    source.buffer = zone.buffer
    source.playbackRate.setValueAtTime(playbackrate,t)
    if(zone.loopEnd - zone.loopStart > 10){
      source.loop = true
      source.loopStart = (zone.loopStart / zone.sampleRate) 
      source.loopEnd = (zone.loopEnd / zone.sampleRate) 
    }
    let gain = ctx.createGain()
    gain.gain.setValueAtTime(1,t)
    if(zone.ahdsr){
      gain.gain.linearRampToValueAtTime(.5,t+1.5)
      gain.gain.linearRampToValueAtTime(0,t+3)
    }else{
      void null
    }
    let audioNode = source.connect(gain)
    return {source,audioNode}
  }else{
    // 纯振荡器
    // sin波形模拟频率
    // 261.6 为标准fa音
    let t  = startTime?startTime:ctx.currentTime
    let o = ctx.createOscillator()
    o.type="sine"
    let b = 261.6*Math.pow(2,(key-60)/12)
    o.frequency.setValueAtTime(b,t)
    let g = ctx.createGain()
    g.gain.setValueAtTime(1,t)
    g.gain.linearRampToValueAtTime(.0,t+1)
    return {source:o,audioNode:o.connect(g)}
  }
}
