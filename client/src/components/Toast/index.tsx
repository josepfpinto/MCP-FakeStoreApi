import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ $type: string; $isVisible: boolean }>`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  max-width: 400px;
  width: auto;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  animation: ${(props) => (props.$isVisible ? slideIn : slideOut)} 0.3s ease-out;

  ${(props) => {
    switch (props.$type) {
      case "success":
        return "background: #38a169; color: white;";
      case "error":
        return "background: #e53e3e; color: white;";
      case "warning":
        return "background: #d69e2e; color: white;";
      case "info":
        return "background: #3182ce; color: white;";
      default:
        return "background: #718096; color: white;";
    }
  }}
`;

const ToastIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.25rem;
`;

const ToastMessage = styled.span`
  flex: 1;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  margin-left: 0.75rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "✅";
    case "error":
      return "❌";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "ℹ️";
  }
};

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for animation to complete
  };

  return (
    <ToastContainer $type={type} $isVisible={isVisible}>
      <ToastIcon>{getIcon(type)}</ToastIcon>
      <ToastMessage>{message}</ToastMessage>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </ToastContainer>
  );
};

export default Toast;
