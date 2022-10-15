export let notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const
export function gk(note:typeof notes[number],n:number){
  let smallCharacterGroup = 5 // 小字组
  let bigCharacterGroup = 4 // 大字组
  let name:string;
  if(n>=smallCharacterGroup){
    let a = n-smallCharacterGroup
    let subfix = a==0?"":a+""
    name = note.toLowerCase() + subfix
  }else{
    let a = bigCharacterGroup - n
    let subfix = a==0?"":a+""
    name = note + subfix
  }
  return [notes.indexOf(note) + (n * 12),name] as const
}
export let expertKeymap = [
  "1234567".split(""),
  "qwertyu".split(""),
  "asdfghj".split(""),
  "zxcvbnm".split("")
] as const
// musical scale 6 -> c1,5->c,4->C,3->C1
export function getExpert(aInMusicalScale:number,major:typeof notes[number],keyCharacter:string){
  let first = aInMusicalScale - 2
  let keyR = null as null | [number,number]
  expertKeymap.forEach((item,index)=>{
    let col = item.indexOf(keyCharacter)
    if(col == -1){
      void 0
    }else{
      keyR = [index,col]
    }
  })
  if(keyR){
    let musicalScale = first + keyR[0]
    let doremi = keyR[1] + 1 as Doremi
    return getMusicalKey(musicalScale,major,doremi)
  }else{
    return null
  }
}
export type Doremi = 1 | 2 | 3 | 4 | 5 | 6 | 7
function getNote(major:typeof notes[number],doremi:Doremi){
  let a = [2,2,1,2,2,2,1] as const //琴键之间do re mi的距离
  let b = a.slice(0,doremi - 1).reduce((a,b)=>a+b,0)
  let c  = notes.indexOf(major) + b
  return [notes[c%notes.length],c < notes.length ? 0 : 1] as const
}
export function getMusicalKey(musicalScale:number,major:typeof notes[number],doremi:Doremi){
  let [note,n] = getNote(major,doremi)
  return gk(note,musicalScale+n)
}
export let keymap = {
  "1":gk("C",3),"!":gk("C#",3),
  "2":gk("D",3),"@":gk("D#",3),
  "3":gk("E",3),
  "4":gk("F",3),"$":gk("F#",3),
  "5":gk("G",3),"%":gk("G#",3),
  "6":gk("A",3),"^":gk("A#",3),
  "7":gk("B",3),
  "8":gk("C",4),"*":gk("C#",4),
  "9":gk("D",4),"(":gk("D#",4),
  "0":gk("E",4),
  "q":gk("F",4),"Q":gk("F#",4),
  "w":gk("G",4),"W":gk("G#",4),
  "e":gk("A",4),"E":gk("A#",4),
  "r":gk("B",4), 
  "t":gk("C",5),"T":gk("C#",5),
  "y":gk("D",5),"Y":gk("D#",5),
  "u":gk("E",5),
  "i":gk("F",5),"I":gk("F#",5),
  "o":gk("G",5),"O":gk("G#",5),
  "p":gk("A",5),"P":gk("A#",5),
  "a":gk("B",5),
  "s":gk("C",6),"S":gk("C#",6),
  "d":gk("D",6),"D":gk("D#",6),
  "f":gk("E",6),
  "g":gk("F",6),"G":gk("F#",6),
  "h":gk("G",6),"H":gk("G#",6),
  "j":gk("A",6),"J":gk("A#",6),
  "k":gk("B",6),
  "l":gk("C",7),"L":gk("C#",7),
  "z":gk("D",7),"Z":gk("D#",7),
  "x":gk("E",7),
  "c":gk("F",7),"C":gk("F#",7),
  "v":gk("G",7),"V":gk("G#",7),
  "b":gk("A",7),"B":gk("A#",7),
  "n":gk("B",7),
  "m":gk("C",8),"M":gk("C#",8),

} as Record<string,ReturnType<typeof gk>>
export let lyrics = [`
opsdfapaop
sdfhjsdfgf
fhjhjpfdsd
fopafps
hhjlkjhj
opsdfapaop
sdfhjsdfgf
fhjhjpfdsd
fopafps
hhjlkjhj
hhjlkjhf
`.trim().split("\n"),`
uop
psd
fhf
dsp
fdp
fdp
ou
uop
psd
fhf
dsp
fdp
fdp
op
fhjjhjkhjhdffhjjhjlkhf
fhjjhjkhjhdffdpfdpop
fdpfdpop
`.trim().split("\n"),`
w0wt-etw
w890989
w0wtretw
w90q78
ett
rert
erteew089
w0wtretw
w90q78--
  `.trim().split("\n"),`
1231
1231
345
345
565431
565431
251
251
`.trim().split("\n"),`
1155665
4433221
5544332
5544332
1155665
4433221
`.trim().split("\n"),
]