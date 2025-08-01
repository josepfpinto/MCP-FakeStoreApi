import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  ChatContainer,
  MessagesContainer,
  MessageGroup,
  MessageContent,
  MessageBubble,
  MessageText,
  MessageTime,
  Avatar,
  InputContainer,
  InputForm,
  InputField,
  SendButton,
  StatusIndicator,
  StatusDot,
  StatusText,
} from "./styled-components";
import type { Message } from "./types";

const ChatPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hi ${
        user?.firstName || "there"
      }! What can I help you with today?`,
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Simulate assistant response (placeholder for Phase 3)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm not fully connected yet! In Phase 3, I'll be able to help you with shopping. For now, I'm just a UI placeholder.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ChatContainer id="chat-container">
      {/* Messages Container */}
      <MessagesContainer>
        {messages.map((message) => (
          <MessageGroup key={message.id} $sender={message.sender}>
            <MessageContent $sender={message.sender}>
              <MessageBubble $sender={message.sender}>
                <MessageText>{message.content}</MessageText>
              </MessageBubble>
              <MessageTime $sender={message.sender}>
                {formatTime(message.timestamp)}
              </MessageTime>
            </MessageContent>

            {/* Avatar */}
            <Avatar $sender={message.sender}>
              {message.sender === "user"
                ? user?.firstName?.charAt(0) || "U"
                : "🤖"}
            </Avatar>
          </MessageGroup>
        ))}
      </MessagesContainer>

      {/* Input Container */}
      <InputContainer>
        <InputForm onSubmit={handleSendMessage}>
          <InputField
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={false} // Will be controlled by agent state in Phase 3
          />
          <SendButton type="submit" disabled={!inputMessage.trim()}>
            Send
          </SendButton>
        </InputForm>

        {/* Status indicator */}
        <StatusIndicator>
          <StatusDot />
          <StatusText>
            Phase 2: UI Only - LangChain integration coming in Phase 3
          </StatusText>
        </StatusIndicator>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPage;
