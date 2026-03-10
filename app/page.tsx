"use client";

import { useState } from "react";

type Player = {
  id: string;
  name: string;
  position: string;
};

type Fixture = {
  id: string;
  opponent: string;
  match_date: string;
  venue: string;
};

export default function Page() {

const [players] = useState<Player[]>([
{ id:"1", name:"Bailee Dowler-Rowles", position:"DEF"},
{ id:"2", name:"Bella Bainbridge", position:"MID"},
{ id:"3", name:"Betsy Rowland", position:"MID/DEF"},
{ id:"4", name:"Connie Luff", position:"MID/FWD"},
{ id:"5", name:"Darcy-Rae Russell", position:"GK"},
{ id:"6", name:"Ella Wilson", position:"MID/DEF"},
{ id:"7", name:"Elsy Harmer", position:"DEF"},
{ id:"8", name:"Evelyn Evans", position:"MID/DEF"},
{ id:"9", name:"Isabella Ogden", position:"DEF/MID"},
{ id:"10", name:"Lyra Twinning", position:"MID/FWD"},
{ id:"11", name:"Martha Scrivens", position:"MID/FWD"},
{ id:"12", name:"Olivia Hassall", position:"DEF"},
{ id:"13", name:"Poppy Bennett", position:"MID/FWD"},
{ id:"14", name:"Ruby Salter", position:"MID/DEF"},
]);

const [fixtures] = useState<Fixture[]>([
{
id:"1",
opponent:"Tigers",
match_date:"2026-03-15",
venue:"Home"
}
]);

const [availability,setAvailability] = useState<Record<string,Set<string>>>({});
const [squad,setSquad] = useState<Player[]>([]);
const [bench,setBench] = useState<Player[]>([]);

function toggleAvailability(fixtureId:string,playerId:string){

const current = availability[fixtureId] || new Set<string>();
const updated = new Set(current);

if(updated.has(playerId)){
updated.delete(playerId);
}else{
updated.add(playerId);
}

setAvailability(prev=>({
...prev,
[fixtureId]:updated
}));

}

function isAvailable(fixtureId:string,playerId:string){
return availability[fixtureId]?.has(playerId) || false;
}

function generateSquad(fixtureId:string){

const available = players.filter(p=>isAvailable(fixtureId,p.id));

setSquad(available.slice(0,7));
setBench(available.slice(7));

}

return(

<main style={{padding:20,maxWidth:500,margin:"auto"}}>

<h1>Sharks Team Manager</h1>

<h2>Players</h2>

{players.map(p=>(
<div key={p.id}>
{p.name} • {p.position}
</div>
))}

<h2 style={{marginTop:40}}>Fixtures</h2>

{fixtures.map(f=>(

<div key={f.id} style={{border:"1px solid #ddd",padding:16,marginTop:20,borderRadius:12}}>

<h3>{f.opponent}</h3>
<p>{f.match_date} • {f.venue}</p>

<button onClick={()=>generateSquad(f.id)}>
Generate Squad
</button>

{ squad.length>0 && (

<div style={{marginTop:20}}>

<h4>Starting 7</h4>
{squad.map(p=>(
<div key={p.id}>{p.name}</div>
))}

<h4 style={{marginTop:16}}>Bench</h4>
{bench.map(p=>(
<div key={p.id}>{p.name}</div>
))}

</div>

)}

<div style={{marginTop:20}}>

{players.map(player=>(

<label key={player.id} style={{display:"block"}}>

<input
type="checkbox"
checked={isAvailable(f.id,player.id)}
onChange={()=>toggleAvailability(f.id,player.id)}
/>

{player.name}

</label>

))}

</div>

</div>

))}

</main>

);

}
