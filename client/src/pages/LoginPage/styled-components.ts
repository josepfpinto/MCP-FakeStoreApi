import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    rgb(247, 250, 252) 0%,
    rgb(229, 230, 235) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const FormCard = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 5px 10px -5px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 360px;
  padding: 20px;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: bold;
  color: hsl(220, 11.8%, 20%);
  margin-bottom: 0.4rem;
`;

export const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.975rem;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 0.4rem;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const Input = styled.input<{ $hasToggle?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: ${({ $hasToggle }) => ($hasToggle ? "3rem" : "1rem")};
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.975rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background-color: rgb(247, 250, 252);
  color: rgb(45, 49, 57);

  &:focus {
    outline: none;
    border-color: #6b7280;
    // box-shadow: 0 0 0 1px #6b7280;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const ToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
  }
`;

export const HelperText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
`;

export const ErrorMessage = styled.div`
  // background: #fef2f2;
  // border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: rgb(152, 55, 55);
  font-size: 0.975rem;
`;

export const SubmitButton = styled.button`
  width: 100%;
  background: hsl(220, 11.8%, 20%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: hsl(220, 13.6%, 8.6%);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px hsl(220, 13.6%, 8.6%),
      0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

export const LoadingSpinner = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const DemoSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgb(247, 250, 252);
  border-radius: 0.5rem;
`;

export const DemoTitle = styled.p`
  font-size: 0.975rem;
  color: #6b7280;
  margin-bottom: 0.4rem;
  margin-top: 0;
`;

export const DemoCredentials = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const DemoItem = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
`;

export const DemoLabel = styled.strong`
  font-weight: 600;
`;

export const WarningText = styled.p`
  color: #d97706;
  font-size: 0.75rem;
  margin: 0.25rem 0 0 0;
`;
