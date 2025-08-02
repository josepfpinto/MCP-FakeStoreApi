import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const Content = styled.div`
  text-align: center;
`;

export const ErrorIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 1rem;
`;

export const Title = styled.h1`
  font-size: 4rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 1rem;
`;

export const Message = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`;

export const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #e5e7eb;
  color: #374151;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #d1d5db;
  }
`;
