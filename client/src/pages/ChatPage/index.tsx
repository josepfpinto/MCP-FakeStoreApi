import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { createAgentService } from "../../services/langchainAgent";
import type { LangChainAgentService } from "../../services/langchainAgent";
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
  const { user, openaiApiKey, mcpApiKeys } = useSelector(
    (state: RootState) => state.auth
  );
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
  const [agentReady, setAgentReady] = useState(false);
  const agentServiceRef = useRef<LangChainAgentService | null>(null);

  // Initialize agent service
  useEffect(() => {
    console.log("🔧 Setting up AI agent...");
    const activeMcpKeys = mcpApiKeys.filter((key) => key.isActive);
    console.log(
      `🔑 Setup status: OpenAI=${!!openaiApiKey}, MCP=${activeMcpKeys.length}/${
        mcpApiKeys.length
      } active`
    );

    const getState = () => ({
      auth: {
        user,
        openaiApiKey,
        mcpApiKeys,
        isAuthenticated: true,
        jwtToken: null,
        isLoading: false,
        error: null,
      },
    });
    agentServiceRef.current = createAgentService(getState);

    // Check if agent is ready and initialize if needed
    const checkAgentReady = async () => {
      if (agentServiceRef.current) {
        let ready = agentServiceRef.current.isReady();

        // If not ready but can initialize, do it automatically
        if (!ready && agentServiceRef.current.canInitialize()) {
          try {
            console.log("🔄 Auto-initializing agent...");
            await agentServiceRef.current.initialize();
            ready = agentServiceRef.current.isReady();
            if (ready) {
              console.log("✅ AI agent ready");
            }
          } catch (error) {
            console.error("❌ Agent initialization failed:", error);
          }
        }

        setAgentReady(ready);
      } else {
        console.log("❌ Agent service failed to create");
        setAgentReady(false);
      }
    };

    checkAgentReady();
  }, [openaiApiKey, mcpApiKeys, user]);

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
      if (!agentServiceRef.current) {
        throw new Error("Agent service not initialized");
      }

      const response = await agentServiceRef.current.sendMessage(inputMessage);

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
                : agentReady
                ? "Type your message here..."
                : "Setting up AI assistant..."
            }
            disabled={isLoading || !agentReady}
          />
          <SendButton
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !agentReady}
          >
            {isLoading ? "Sending..." : "Send"}
          </SendButton>
        </InputForm>

        {/* Status indicator */}
        <StatusIndicator>
          <StatusDot $isActive={agentReady && !isLoading} />
          <StatusText>
            {isLoading
              ? "AI is thinking..."
              : agentReady
              ? "Ready - AI assistant connected"
              : "Connecting to AI assistant..."}
          </StatusText>
        </StatusIndicator>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPage;
