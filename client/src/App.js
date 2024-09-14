import "./App.css";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";

// Ensure you're connecting to the right server (use the correct port if different)
const socket = io("http://localhost:3001");

function App() {
  const [userType, setUserType] = useState(""); // 'attendant' or 'passenger'
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const chatBoxRef = useRef(null); // Reference to chat box for scrolling

  const login = (type) => {
    setUserType(type);
    setLoggedIn(true);
    socket.emit("join", type);
  };

  const sendMessage = () => {
    if (message !== "") {
      socket.emit("send_message", { message, userType });
      setMessageReceived((prevMessages) => [
        ...prevMessages,
        { message, sent: true },
      ]);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived((prevMessages) => [
        ...prevMessages,
        { message: data.message, sent: false },
      ]);
    });
  }, []);

  useEffect(() => {
    // Auto-scroll to the bottom of the chat box when a new message is added
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messageReceived]);

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="login-container">
          <h2>Login</h2>
          <button className="login-btn" onClick={() => login("attendant")}>
            Log in as Attendant
          </button>
          <button className="login-btn" onClick={() => login("passenger")}>
            Log in as Passenger
          </button>
        </div>
      ) : (
        <div className="chat-container">
          <h1>Chat with {userType === "attendant" ? "Passenger" : "Attendant"}</h1>
          <div className="chat-box" ref={chatBoxRef}>
            {messageReceived.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sent ? "sent" : "received"}`}
              >
                {msg.message}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              className="message-input"
              placeholder="Type a message..."
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
              }}
            />
            <button className="send-btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;