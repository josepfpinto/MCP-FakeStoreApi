import styled from "styled-components";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #f9fafb;
  height: 100vh; /* Full viewport height */
  position: relative;
  overflow: hidden; /* Prevent container overflow */
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  padding-bottom: 120px; /* Space for fixed input container */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(
    100vh - 120px
  ); /* Constrain height leaving space for input */
`;

export const MessageGroup = styled.div<{ $sender: "user" | "assistant" }>`
  display: flex;
  align-items: flex-center;
  justify-content: ${({ $sender }) =>
    $sender === "user" ? "flex-end" : "flex-start"};
  gap: 0.75rem;
`;

export const MessageContent = styled.div<{ $sender: "user" | "assistant" }>`
  max-width: 24rem;
  order: ${({ $sender }) => ($sender === "user" ? "2" : "1")};

  @media (min-width: 1024px) {
    max-width: 28rem;
  }

  @media (min-width: 1280px) {
    max-width: 32rem;
  }
`;

export const MessageBubble = styled.div<{ $sender: "user" | "assistant" }>`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: ${({ $sender }) => ($sender === "user" ? "#2563eb" : "white")};
  color: ${({ $sender }) => ($sender === "user" ? "white" : "#111827")};
  border: ${({ $sender }) =>
    $sender === "assistant" ? "1px solid #e5e7eb" : "none"};
`;

export const MessageText = styled.p`
  font-size: 0.875rem;
  margin: 0;
`;

export const MessageTime = styled.div<{ $sender: "user" | "assistant" }>`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: ${({ $sender }) => ($sender === "user" ? "right" : "left")};
`;

export const Avatar = styled.div<{ $sender: "user" | "assistant" }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  order: ${({ $sender }) => ($sender === "user" ? "1" : "2")};
  background: ${({ $sender }) => ($sender === "user" ? "#2563eb" : "#e5e7eb")};
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
`;

export const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

export const InputForm = styled.form`
  display: flex;
  gap: 1rem;
`;

export const InputField = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

export const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const StatusIndicator = styled.div`
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
`;

export const StatusDot = styled.div<{ $isActive?: boolean }>`
  width: 0.5rem;
  height: 0.5rem;
  background: ${({ $isActive }) => ($isActive ? "#10b981" : "#fbbf24")};
  border-radius: 50%;
  margin-right: 0.5rem;
  transition: background-color 0.3s ease;
`;

export const StatusText = styled.span`
  /* Inherits color from parent */
`;
