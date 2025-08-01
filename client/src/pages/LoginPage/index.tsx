import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { loginUser, clearError } from "../../store/slices/authSlice";
import {
  Container,
  FormCard,
  Header,
  Title,
  Subtitle,
  Form,
  FieldGroup,
  Label,
  InputWrapper,
  Input,
  ToggleButton,
  HelperText,
  ErrorMessage,
  SubmitButton,
  LoadingSpinner,
  DemoSection,
  DemoTitle,
  DemoCredentials,
  DemoItem,
  DemoLabel,
  WarningText,
} from "./styled-components";
import type { LoginFormData } from "./types";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    openaiApiKey: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Get the intended destination or default to chat
  const from = location.state?.from?.pathname || "/chat";

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect to intended destination if already authenticated
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.openaiApiKey) {
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      // Error is handled by Redux state
      console.error("Login failed:", error);
    }
  };

  return (
    <Container>
      <FormCard>
        <Header>
          <Title>MCP Shopping Assistant</Title>
          <Subtitle>Sign in to your account</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Username Field */}
          <FieldGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </FieldGroup>

          {/* Password Field */}
          <FieldGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                $hasToggle
              />
              <ToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </ToggleButton>
            </InputWrapper>
          </FieldGroup>

          {/* OpenAI API Key Field */}
          <FieldGroup>
            <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
            <InputWrapper>
              <Input
                type={showApiKey ? "text" : "password"}
                id="openaiApiKey"
                name="openaiApiKey"
                value={formData.openaiApiKey}
                onChange={handleInputChange}
                placeholder="sk-..."
                required
                autoComplete="off"
                $hasToggle
              />
              <ToggleButton
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? "👁️" : "🙈"}
              </ToggleButton>
            </InputWrapper>
            <HelperText>
              Your API key will be stored locally and used for LangChain
              integration
            </HelperText>
          </FieldGroup>

          {/* Error Message */}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {/* Submit Button */}
          <SubmitButton
            type="submit"
            disabled={
              isLoading ||
              !formData.username ||
              !formData.password ||
              !formData.openaiApiKey
            }
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </SubmitButton>
        </Form>

        {/* Demo Credentials */}
        <DemoSection>
          <DemoTitle>Demo Credentials:</DemoTitle>
          <DemoCredentials>
            <DemoItem>
              <DemoLabel>Username:</DemoLabel> johnd
            </DemoItem>
            <DemoItem>
              <DemoLabel>Password:</DemoLabel> m38rmF$
            </DemoItem>
            <WarningText>⚠️ Use your own OpenAI API key</WarningText>
          </DemoCredentials>
        </DemoSection>
      </FormCard>
    </Container>
  );
};

export default LoginPage;
