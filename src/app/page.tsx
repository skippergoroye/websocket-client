"use client";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  sender: string;
  message: string;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket: Socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected:", newSocket.id);
    });

    newSocket.on("chatMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket && input.trim() && username) {
      socket.emit("chatMessage", { sender: username, message: input });
      setInput("");
    }
  };

  if (!connected) {
    return (
      <div className="p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Enter Chat</h2>
        <input
          className="border p-2 mb-2 w-64"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name (e.g. Alice)"
        />
        <button
          onClick={() => username.trim() && setConnected(true)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Chat as {username}</h2>
      <div className="border p-2 h-64 overflow-y-auto mb-2 rounded-lg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 my-1 rounded-xl max-w-[70%] ${
              msg.sender === username
                ? "bg-blue-500 text-white ml-auto text-right"
                : "bg-gray-200 text-black mr-auto text-left"
            }`}
          >
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
