import styled from "styled-components";

export const Container = styled.div`
  min-height: 100%;
  background: #f9fafb;
`;

export const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
`;

export const HeaderContent = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem;
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
`;

export const Subtitle = styled.p`
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
`;

export const Content = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const Card = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
`;

export const CardHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

export const NewKeyButton = styled.button`
  padding: 0.5rem 1rem;
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

export const Form = styled.form`
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

export const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  padding: 0.5rem 1rem;
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

export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #b91c1c;
`;

export const Section = styled.div`
  padding: 1.5rem;
`;

export const SectionHeader = styled.div`
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

export const SectionSubtitle = styled.p`
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
`;

export const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  color: #9ca3af;
  font-size: 6rem;
  margin-bottom: 1rem;
`;

export const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
`;

export const EmptyDescription = styled.p`
  color: #6b7280;
  margin-bottom: 1rem;
`;

export const EmptyButton = styled.button`
  padding: 0.5rem 1rem;
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

export const ApiKeyList = styled.div`
  border-top: 1px solid #e5e7eb;
`;

export const ApiKeyItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  &:last-child {
    border-bottom: none;
  }
`;

export const ApiKeyContent = styled.div`
  flex: 1;
`;

export const ApiKeyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

export const ApiKeyName = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
`;

export const StatusBadge = styled.span<{ $isActive: boolean }>`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background: ${({ $isActive }) => ($isActive ? "#dcfce7" : "#fef2f2")};
  color: ${({ $isActive }) => ($isActive ? "#166534" : "#b91c1c")};
`;

export const ApiKeyDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ApiKeyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ApiKeyLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

export const ApiKeyCode = styled.code`
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
`;

export const CopyButton = styled.button`
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #1d4ed8;
  }
`;

export const ApiKeyInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

export const InfoText = styled.p`
  margin: 0;
`;

export const ApiKeyActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
`;

export const ActionButton = styled.button`
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

export const RevokeButton = styled(ActionButton)`
  background: #fef3c7;
  color: #92400e;

  &:hover {
    background: #fde68a;
  }
`;

export const DeleteButton = styled(ActionButton)`
  background: #fef2f2;
  color: #b91c1c;

  &:hover {
    background: #fecaca;
  }
`;

export const UsageInstructions = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1.5rem;
`;

export const InstructionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.75rem;
`;

export const InstructionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e40af;
`;

export const InstructionText = styled.p`
  margin: 0;
`;

export const CodeBlock = styled.code`
  display: block;
  background: #dbeafe;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: monospace;
  margin-top: 0.5rem;
`;

export const InlineCode = styled.code`
  background: #dbeafe;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
`;
