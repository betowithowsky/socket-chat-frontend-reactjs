import React, { useState, useEffect } from "react";
import { ChatContainer, OnlineUserList } from "./styles";

const USER_CONFIG_DEFAULT = { name: "" };

const Chat = ({ socket }) => {
  //config_user
  const [userConfig, setUserConfig] = useState(USER_CONFIG_DEFAULT);
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

  function login() {
    socket.emit("user:login", userConfig);
    socket.emit("users:get");
    sethasLoged(true);
  }

  useEffect(() => {
    socket.on("response", ({ type, data }) => {
      console.log(type, data);
      if (type === "user:added") {
        setUsersOnline((prevState) => [...prevState, data]);
      }
      if (type === "user:login") {
        setCurrentUser(data);
      }
      if (type === "message:new") {
        setMessages((prevState) => [...prevState, data]);
      }
      if (type === "message:sendAll") {
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
    // return () => socket.emit("user:logout");
  }, [socket]);

  const setUserToSendMessage = (selectedTargetUser) => {
    if (selectedTargetUser.userId === targetUser.userId) {
      setTargetUser({});
      return;
    }
    setTargetUser(selectedTargetUser);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onSendMessage();
    }
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
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "20%", borderRight: '1px solid #d4d4d4' }}>
        <div style={{ fontWeight: "bold" }}>Online:</div>
        <div>
          {usersOnline.map((user, index) => (
            <OnlineUserList
              key={index}
              onClick={() => setUserToSendMessage(user)}
              isSelected={targetUser.userId === user.userId}
            >
              {user.nickname}
            </OnlineUserList>
          ))}
        </div>
      </div>

      <ChatContainer>
        <div className="chatHeader">
          <div>
            <div style={{ fontWeight: "bold" }}>Perfil:</div>
            <div>{`username: ${currentUser.username} - nickname: ${currentUser.nickname} - userid: ${currentUser.userId}`}</div>
          </div>
          <button
            onClick={() => {
              window.location.reload();
            }}
          >
            Sair
          </button>
        </div>

        <div>
          <ul id="messages">
            {messages.map((message, index) => {
              return (
                <li key={index}>{`${new Date(
                  message.time
                ).toLocaleTimeString()} - ${message.nickname}: ${
                  message.content
                }`}</li>
              );
            })}
          </ul>
          <div id="form">
            <input
              id="input"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={onSendMessage}>Send</button>
          </div>
        </div>
      </ChatContainer>
    </div>
  );
};

export default Chat;
