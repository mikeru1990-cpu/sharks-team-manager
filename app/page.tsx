"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

type Player = {
  id: string
  name: string
  positions: string[]
}

export default function Page() {

  const [players,setPlayers] = useState<Player[]>([])
  const [bench,setBench] = useState<Player[]>([])
  const [pitch,setPitch] = useState<Player[]>([])

  const [selectedPlayer,setSelectedPlayer] = useState<string | null>(null)

  const [matchSeconds,setMatchSeconds] = useState(0)
  const [timerRunning,setTimerRunning] = useState(false)

  const [minutes,setMinutes] = useState<Record<string,number>>({})

  useEffect(()=>{

    loadPlayers()

  },[])

  async function loadPlayers(){

    const {data} = await supabase
      .from("players")
      .select("*")

    if(!data) return

    const parsed = data.map((p:any)=>({

      id:p.id,
      name:p.name,
      positions:JSON.parse(p.positions_json || "[]")

    }))

    setPlayers(parsed)
    setBench(parsed)

  }

  useEffect(()=>{

    if(!timerRunning) return

    const interval = setInterval(()=>{

      setMatchSeconds(s=>s+1)

      setMinutes(prev=>{

        const next={...prev}

        pitch.forEach(p=>{
          next[p.id]=(next[p.id]||0)+1
        })

        return next

      })

    },60000)

    return ()=>clearInterval(interval)

  },[timerRunning,pitch])

  function formatTime(sec:number){

    const m=Math.floor(sec/60)
    const s=sec%60

    return `${m}:${s.toString().padStart(2,"0")}`

  }

  function selectPlayer(id:string){

    setSelectedPlayer(id)

  }

  function moveToPitch(index:number){

    if(!selectedPlayer) return

    const player=bench.find(p=>p.id===selectedPlayer)

    if(!player) return

    const newPitch=[...pitch]

    if(newPitch[index]){

      const swapped=newPitch[index]

      setBench(b=>[...b.filter(p=>p.id!==player.id),swapped])

    }

    newPitch[index]=player

    setPitch(newPitch)
    setBench(b=>b.filter(p=>p.id!==player.id))

    setSelectedPlayer(null)

  }

  function moveToBench(id:string){

    const player=pitch.find(p=>p.id===id)
    if(!player) return

    setPitch(p=>p.filter(x=>x.id!==id))
    setBench(b=>[...b,player])

  }

  return (

    <main style={{padding:20,maxWidth:900,margin:"auto",fontFamily:"Arial"}}>

      <h1>Sharks Team Manager</h1>

      <h2>Live Match</h2>

      <div style={{marginBottom:20}}>

        <strong>Match Timer</strong>

        <div style={{fontSize:28}}>{formatTime(matchSeconds)}</div>

        <button onClick={()=>setTimerRunning(true)}>Start</button>
        <button onClick={()=>setTimerRunning(false)}>Pause</button>
        <button onClick={()=>setMatchSeconds(0)}>Reset</button>

      </div>

      {selectedPlayer && (

        <div style={{
          background:"#e6f4ff",
          padding:10,
          borderRadius:10,
          marginBottom:10
        }}>
          Selected: {players.find(p=>p.id===selectedPlayer)?.name}
        </div>

      )}

      <div style={{
        background:"#2e7d32",
        padding:20,
        borderRadius:12,
        color:"white"
      }}>

        <h3>Pitch</h3>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(3,1fr)",
          gap:10
        }}>

          {Array.from({length:7}).map((_,i)=>{

            const player=pitch[i]

            return(

              <button
                key={i}
                onClick={()=>{

                  if(selectedPlayer) moveToPitch(i)

                  else if(player) selectPlayer(player.id)

                }}
                style={{
                  height:80,
                  borderRadius:10,
                  border:"2px solid white",
                  background:"rgba(255,255,255,0.2)",
                  color:"white"
                }}
              >

                {player?player.name:"Empty"}

                {player && (
                  <div style={{fontSize:12}}>
                    {formatTime(minutes[player.id]||0)}
                  </div>
                )}

              </button>

            )

          })}

        </div>

      </div>

      <h3 style={{marginTop:30}}>Bench</h3>

      {bench.map(p=>(

        <button
          key={p.id}
          onClick={()=>selectPlayer(p.id)}
          style={{
            display:"block",
            width:"100%",
            marginBottom:6,
            padding:10,
            borderRadius:10,
            border:selectedPlayer===p.id?"3px solid blue":"1px solid #ccc",
            background:"#fff1b8"
          }}
        >

          {p.name}

          <span style={{float:"right"}}>
            {formatTime(minutes[p.id]||0)}
          </span>

        </button>

      ))}

      <h3 style={{marginTop:30}}>On Field List</h3>

      {pitch.map(p=>(

        <button
          key={p.id}
          onClick={()=>moveToBench(p.id)}
          style={{
            display:"block",
            width:"100%",
            marginBottom:6,
            padding:10,
            borderRadius:10,
            border:"1px solid #ccc",
            background:"#d9f7be"
          }}
        >

          {p.name}

          <span style={{float:"right"}}>
            {formatTime(minutes[p.id]||0)}
          </span>

        </button>

      ))}

      <h3 style={{marginTop:30}}>Minutes Summary</h3>

      {players
        .sort((a,b)=>(minutes[b.id]||0)-(minutes[a.id]||0))
        .map(p=>(

        <div key={p.id}
          style={{
            padding:8,
            border:"1px solid #ddd",
            marginBottom:4,
            borderRadius:6
          }}>

          {p.name} — {formatTime(minutes[p.id]||0)}

        </div>

      ))}

    </main>

  )

}
