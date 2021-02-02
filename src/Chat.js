import React, { useState, useEffect } from 'react'

    
const Chat = ({socket}) => {
  
  const [usersOnline, setUsersOnline] = useState([])
  const [targetUser, setTargetUser] = useState({})
  const [currentUser, setCurrentUser] = useState({userId: null, username: '', nickname: ''})
  const [currentMessage, setCurrentMessage] = useState({ 
    content: '',
    from: '',
    time: '',
    to: currentUser.userId
  })
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.emit('user:login')
    socket.emit('users:get')

    socket.on("response", ({type, data}) => {
      console.log('algum on', type, data)
      if(type === 'user:added'){
        setUsersOnline((prevState) => ([...prevState, data]))
      }
      if(type === 'user:login'){
        setCurrentUser(data)
      }
      if(type === 'message:new'){
        console.log('new', data)
        setMessages((prevState) => ([...prevState, data]))
      }
      if(type === 'message:send'){
        console.log('send', data)
        setMessages((prevState) => ([...prevState, data]))
      }
      if(type === 'users:get'){
        setUsersOnline(data)
      }
      if(type === 'user:removed'){
        const userOnlineFiltred = usersOnline.filter(el => el.userId === data.userId)
        setUsersOnline(userOnlineFiltred)
      }
      
    });

  }, [socket]);

  const setUserToSendMessage = (targetUser) => {
    console.log(targetUser)
    setTargetUser(targetUser)
  }

  const onSendMessage = () => {
    if(currentMessage){
      socket.emit("message:send", { 
        content: currentMessage,
        from: currentUser.userId,
        time: new Date().getTime(),
        to: targetUser.userId
      })
      setCurrentMessage({ 
        ...currentMessage,
        content: '',
      })
    }
  }
  
    return (
    <>
    <div>{usersOnline.map((user, index) => <div key={index} onClick={() =>setUserToSendMessage(user) }>{user.nickname}</div>)}</div>
    <div>{`username: ${currentUser.username} - nickname: ${currentUser.nickname} - userid: ${currentUser.userId}`}</div>
        <div>
          <ul id="messages">
            {messages.map((el, index) => {
              return <li key={index}>{`${el.from}: ${el.content}`}</li>
            })}
          </ul>
          <div id="form">
            <input id="input" value={currentMessage.content} onChange={(e) => setCurrentMessage(e.target.value)} /><button onClick={onSendMessage}>Send</button>
          </div>
        </div>
        </>
    )
}

export default Chat