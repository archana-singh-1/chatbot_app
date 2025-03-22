import React, { useState } from "react";
import "./App.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

 
  const apiKey = import.meta.env.VITE_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
        }),
      });

      const data = await response.json();

      let botText = "Sorry, I didn't understand that.";

  
      if (
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0] &&
          data.candidates[0].content.parts[0].text
          ) {
              botText = data.candidates[0].content.parts[0].text;
            }

      typeMessage(botText);
      
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
    }
  };

  const typeMessage = (fullText) => {
    let i = 0;
    let displayedText = "";

    const interval = setInterval(() => {
      if (i < fullText.length) {
        displayedText += fullText[i];
        setMessages((prevMessages) => {
          let newMessages = [...prevMessages];
          let lastMessage = { text: displayedText, sender: "bot" };

          if (newMessages.length > 0 && newMessages[newMessages.length - 1].sender === "bot") {
            newMessages[newMessages.length - 1] = lastMessage;
          } else {
            newMessages.push(lastMessage);
          }
          return newMessages;
        });
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50);
  };

  return (
    <div className="chatContainer">
      <div className="chatBox">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;