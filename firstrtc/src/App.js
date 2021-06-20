
import React, {useState, useEffect, useRef} from 'react'
import  {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import axios from 'axios'
import  io from "socket.io-client";
import Starter from "./Component/Starter"
import CallRoom from "./Component/CallRoom"



function App() {
  const [response, setResponse] = useState("No response")
  const ENDPOINT = 'http://localhost:5000'
  const socket = useRef()


  useEffect(()=>{
    axios.get('/api/v1/say-something').then((res)=>{
      const response = res.data;
      setResponse(response.msg)
      // console.log(response.msg)
    })

    socket.current = io(ENDPOINT)
  },[])


  return (
    <Router> 
      <h1>Hellow world!</h1>
      <h1>{response}</h1>
      <Route path="/join" exact>
        <Starter socket={socket.current}/>
      </Route>
      <Route path="/room" exact>
        <CallRoom socket={socket.current}></CallRoom>
      </Route>

    </Router>
  );
}

export default App;
