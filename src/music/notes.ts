export let notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"] as const
export function gk(note:typeof notes[number],n:number){
  return [notes.indexOf(note) + (n * 12),note + n] as const
}
export let keymap = {
  "1":gk("C",2),"!":gk("C#",2),
  "2":gk("D",2),"@":gk("D#",2),
  "3":gk("E",2),
  "4":gk("F",2),"$":gk("F#",2),
  "5":gk("G",2),"%":gk("G#",2),
  "6":gk("A",2),"^":gk("A#",2),
  "7":gk("B",2),
  "8":gk("C",3),"*":gk("C#",3),
  "9":gk("D",3),"(":gk("D#",3),
  "0":gk("E",3),
  "q":gk("F",3),"Q":gk("F#",3),
  "w":gk("G",3),"W":gk("G#",3),
  "e":gk("A",3),"E":gk("A#",3),
  "r":gk("B",3),
  "t":gk("C",4),"T":gk("C#",4),
  "y":gk("D",4),"Y":gk("D#",4),
  "u":gk("E",4),
  "i":gk("F",4),"I":gk("F#",4),
  "o":gk("G",4),"O":gk("G#",4),
  "p":gk("A",4),"P":gk("A#",4),
  "a":gk("B",4),
  "s":gk("C",5),"S":gk("C#",5),
  "d":gk("D",5),"D":gk("D#",5),
  "f":gk("E",5),
  "g":gk("F",5),"G":gk("F#",5),
  "h":gk("G",5),"H":gk("G#",5),
  "j":gk("A",5),"J":gk("A#",5),
  "k":gk("B",5),
  "l":gk("C",6),"L":gk("C#",6),
  "z":gk("D",6),"Z":gk("D#",6),
  "x":gk("E",6),
  "c":gk("F",6),"C":gk("F#",6),
  "v":gk("G",6),"V":gk("G#",6),
  "b":gk("A",6),"B":gk("A#",6),
  "n":gk("B",6),
  "m":gk("C",7),"M":gk("C#",7),

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