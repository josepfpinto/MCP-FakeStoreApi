import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { chatService } from "../../services/chatService";
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
  const { user, jwtToken } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hi ${
        user?.firstName || "there"
      }! What can I help you with today? I can help you search for products, manage your cart, and browse categories.`,
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatServiceReady, setChatServiceReady] = useState(false);

  // Check chat service availability
  useEffect(() => {
    const checkChatService = async () => {
      console.log("🔧 Checking chat service availability...");
      try {
        const isReady = await chatService.healthCheck();
        setChatServiceReady(isReady);
        if (isReady) {
          console.log("✅ Chat service ready");
        } else {
          console.log("❌ Chat service not available");
        }
      } catch (error) {
        console.error("❌ Chat service check failed:", error);
        setChatServiceReady(false);
      }
    };

    checkChatService();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(
        inputMessage,
        jwtToken || undefined
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "❌ Sorry, I'm having trouble processing your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            placeholder={
              isLoading
                ? "Processing your request..."
                : chatServiceReady
                ? "Type your message here..."
                : "Connecting to AI assistant..."
            }
            disabled={isLoading || !chatServiceReady}
          />
          <SendButton
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !chatServiceReady}
          >
            {isLoading ? "Sending..." : "Send"}
          </SendButton>
        </InputForm>

        {/* Status indicator */}
        <StatusIndicator>
          <StatusDot $isActive={chatServiceReady && !isLoading} />
          <StatusText>
            {isLoading
              ? "AI assistant is thinking..."
              : chatServiceReady
              ? "Ready - AI assistant connected"
              : "Connecting to AI assistant..."}
          </StatusText>
        </StatusIndicator>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPage;
