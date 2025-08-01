import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Content,
  ErrorIcon,
  Title,
  Message,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
} from "./styled-components";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <ErrorIcon>😵</ErrorIcon>
        <Title>Oops!</Title>
        <Message>
          Something went wrong. The page you're looking for doesn't exist.
        </Message>
        <ButtonGroup>
          <PrimaryButton onClick={() => navigate("/chat")}>
            Go to Chat
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate(-1)}>
            Go Back
          </SecondaryButton>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

export default ErrorPage;
