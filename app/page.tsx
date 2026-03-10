"use client"

import { useState } from "react"

type Player = {
  id: string
  name: string
  position: "GK" | "DEF" | "MID" | "FWD"
}

export default function Page() {

const players: Player[] = [
{ id:"1", name:"Bailee Dowler-Rowles", position:"DEF"},
{ id:"2", name:"Bella Bainbridge", position:"MID"},
{ id:"3", name:"Betsy Rowland", position:"MID"},
{ id:"4", name:"Connie Luff", position:"FWD"},
{ id:"5", name:"Darcy-Rae Russell", position:"GK"},
{ id:"6", name:"Ella Wilson", position:"MID"},
{ id:"7", name:"Elsy Harmer", position:"DEF"},
{ id:"8", name:"Evelyn Evans", position:"MID"},
{ id:"9", name:"Isabella Ogden", position:"DEF"},
{ id:"10", name:"Lyra Twinning", position:"MID"},
{ id:"11", name:"Martha Scrivens", position:"FWD"},
{ id:"12", name:"Olivia Hassall", position:"DEF"},
{ id:"13", name:"Poppy Bennett", position:"FWD"},
{ id:"14", name:"Ruby Salter", position:"MID"},
]

const [available,setAvailable] = useState<string[]>([])
const [field,setField] = useState<Player[]>([])
const [bench,setBench] = useState<Player[]>([])
const [selectedField,setSelectedField] = useState<string | null>(null)
const [selectedBench,setSelectedBench] = useState<string | null>(null)

function togglePlayer(id:string){
if(available.includes(id)){
setAvailable(available.filter(p=>p!==id))
}else{
setAvailable([...available,id])
}
}

function shuffle<T>(array:T[]){
return [...array].sort(()=>Math.random()-0.5)
}

function generateSquad(){

const availablePlayers = players.filter(p=>available.includes(p.id))

const gk = shuffle(availablePlayers.filter(p=>p.position==="GK")).slice(0,1)
const def = shuffle(availablePlayers.filter(p=>p.position==="DEF")).slice(0,2)
const mid = shuffle(availablePlayers.filter(p=>p.position==="MID")).slice(0,3)
const fwd = shuffle(availablePlayers.filter(p=>p.position==="FWD")).slice(0,1)

let squad = [...gk,...def,...mid,...fwd]

const used = squad.map(p=>p.id)

const remaining = availablePlayers.filter(p=>!used.includes(p.id))

while(squad.length < 7 && remaining.length){
squad.push(remaining.shift()!)
}

const benchPlayers = availablePlayers.filter(p=>!squad.find(s=>s.id===p.id))

setField(squad)
setBench(benchPlayers)
}

function swapPlayers(){

if(!selectedField || !selectedBench) return

const fieldPlayer = field.find(p=>p.id===selectedField)
const benchPlayer = bench.find(p=>p.id===selectedBench)

if(!fieldPlayer || !benchPlayer) return

setField(field.map(p=>p.id===selectedField ? benchPlayer : p))
setBench(bench.map(p=>p.id===selectedBench ? fieldPlayer : p))

setSelectedField(null)
setSelectedBench(null)
}

function player(index:number){
return field[index]?.name || "-"
}

return (

<main style={{padding:20,maxWidth:600,margin:"auto"}}>

<h1>Sharks Team Manager</h1>

<h2>Players</h2>

{players.map(p=>(
<label key={p.id} style={{display:"block"}}>
<input
type="checkbox"
checked={available.includes(p.id)}
onChange={()=>togglePlayer(p.id)}
/>
{p.name} • {p.position}
</label>
))}

<button
onClick={generateSquad}
style={{marginTop:20}}
>
Generate Squad
</button>

{field.length>0 && (

<>

<h2 style={{marginTop:30}}>Pitch</h2>

<div style={{
background:"#2e7d32",
padding:20,
borderRadius:10,
color:"white"
}}>

<div style={{textAlign:"center",marginBottom:20}}>
<div>FWD</div>
<div
onClick={()=>setSelectedField(field[6]?.id)}
style={{cursor:"pointer"}}
>
{player(6)}
</div>
</div>

<div style={{
display:"flex",
justifyContent:"space-around",
marginBottom:20
}}>

<div onClick={()=>setSelectedField(field[3]?.id)}>
MID<br/>{player(3)}
</div>

<div onClick={()=>setSelectedField(field[4]?.id)}>
MID<br/>{player(4)}
</div>

<div onClick={()=>setSelectedField(field[5]?.id)}>
MID<br/>{player(5)}
</div>

</div>

<div style={{
display:"flex",
justifyContent:"space-around",
marginBottom:20
}}>

<div onClick={()=>setSelectedField(field[1]?.id)}>
DEF<br/>{player(1)}
</div>

<div onClick={()=>setSelectedField(field[2]?.id)}>
DEF<br/>{player(2)}
</div>

</div>

<div style={{textAlign:"center"}}>
GK<br/>
<div onClick={()=>setSelectedField(field[0]?.id)}>
{player(0)}
</div>
</div>

</div>

<h3 style={{marginTop:30}}>Bench</h3>

{bench.map(p=>(
<div
key={p.id}
onClick={()=>setSelectedBench(p.id)}
style={{cursor:"pointer"}}
>
{p.name}
</div>
))}

<button
onClick={swapPlayers}
style={{marginTop:20}}
>
Swap Players
</button>

</>

)}

</main>

)
}
