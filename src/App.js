import React, { useState} from 'react'
import Chat from './Chat'
import { io } from "socket.io-client";
const END_POINT = 'http://localhost:8090'


function App(){
  const [socket] = useState(io(END_POINT))

  return (
      <Chat socket={socket}/>
  );
}

export default App;
