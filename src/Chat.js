import React, { useState, useEffect } from "react";

const Chat = ({ socket }) => {
  //config_user
  const [userConfig, setUserConfig] = useState({ name: "" });
  const [hasLoged, sethasLoged] = useState(false);

  const [usersOnline, setUsersOnline] = useState([]);
  const [targetUser, setTargetUser] = useState({});
  const [currentUser, setCurrentUser] = useState({
    userId: null,
    username: "",
    nickname: "",
  });
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);

  function setupBeforeUnloadListener() {
    window.addEventListener("beforeunload", (ev) => {
      ev.preventDefault();
      return socket.emit("user:logout");
    });
  }

  function login(){
    socket.emit("user:login", userConfig);
    socket.emit("users:get");
    sethasLoged(true)
  }

  useEffect(() => {
      socket.on("response", ({ type, data }) => {
        console.log("algum on", type, data);
        if (type === "user:added") {
          setUsersOnline((prevState) => [...prevState, data]);
        }
        if (type === "user:login") {
          setCurrentUser(data);
        }
        if (type === "message:new") {
          console.log("new", data);
          setMessages((prevState) => [...prevState, data]);
        }
        if (type === "message:sendAll") {
          console.log("sendAll", data);
          setMessages((prevState) => [...prevState, data]);
        }
        if (type === "users:get") {
          setUsersOnline(data);
        }
        if (type === "user:removed") {
          const userOnlineFiltred = usersOnline.filter(
            (el) => el.userId === data.userId
          );
          setUsersOnline(userOnlineFiltred);
        }
      });
      setupBeforeUnloadListener();
  }, [socket]);

  const setUserToSendMessage = (targetUser) => {
    console.log(targetUser);
    setTargetUser(targetUser);
  };

  const onSendMessage = () => {
    if (currentMessage) {
      socket.emit("message:send", {
        content: currentMessage,
        from: currentUser.userId,
        nickname: currentUser.nickname,
        time: new Date().getTime(),
        to: targetUser.userId,
      });
      setCurrentMessage("");
    }
  };

  if (!hasLoged) {
    return (
      <div id="form">
        <input
          id="input"
          value={userConfig?.name}
          onChange={(e) => setUserConfig({ name: e.target.value })}
        />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <>
      <div>
        {usersOnline.map((user, index) => (
          <div key={index} onClick={() => setUserToSendMessage(user)}>
            {user.nickname}
          </div>
        ))}
      </div>
      <div>{`username: ${currentUser.username} - nickname: ${currentUser.nickname} - userid: ${currentUser.userId}`}</div>
      <div>
        <ul id="messages">
          {messages.map((el, index) => {
            return <li key={index}>{`${el.nickname}: ${el.content}`}</li>;
          })}
        </ul>
        <div id="form">
          <input
            id="input"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <button onClick={onSendMessage}>Send</button>
        </div>
      </div>
    </>
  );
};

export default Chat;
