import React, {useRef, useState} from 'react'
import { Redirect } from 'react-router'
import './Starter.css'

export default function Starter({socket}) {
    const roomId = useRef()
    const [joined, setJoined] = useState(false)

    const createRoom = ()=>{
        socket.emit('joinRoom', {'data':roomId.current.value})
        setJoined(true)
        console.log("Emited")
    }

    if(joined){
        return <Redirect to="/room" />
    }

    return (
        <div className="enterRoom">
            <div>
                <input type="text" ref={roomId}></input>
                <div className="choiceBtn">
                    <button>Join Room</button>
                    <button onClick={createRoom}>Create Room</button>
                </div>
            </div>
        </div>
    )
}
