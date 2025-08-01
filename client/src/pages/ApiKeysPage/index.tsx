import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  fetchApiKeys,
  revokeApiKey,
  deleteApiKey,
  clearError,
} from "../../store/slices/authSlice";
import {
  Container,
  Header,
  HeaderContent,
  Title,
  Subtitle,
  Content,
  Card,
  ErrorMessage,
  Section,
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  ApiKeyList,
  ApiKeyItem,
  ApiKeyContent,
  ApiKeyHeader,
  ApiKeyName,
  StatusBadge,
  ApiKeyDetails,
  ApiKeyRow,
  ApiKeyLabel,
  ApiKeyCode,
  ApiKeyInfo,
  InfoText,
  ApiKeyActions,
  RevokeButton,
  DeleteButton,
  UsageInstructions,
  InstructionTitle,
  InstructionContent,
  InstructionText,
  CodeBlock,
  InlineCode,
} from "./styled-components";

const ApiKeysPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mcpApiKeys, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchApiKeys());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleRevokeKey = async (keyId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await dispatch(revokeApiKey(keyId)).unwrap();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteApiKey(keyId)).unwrap();
    } catch (error) {
      console.error("Failed to delete API key:", error);
    }
  };

  // Note: API keys are not returned in list responses for security
  // Keys are only shown once at creation time

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container>
      {/* Page Header */}
      <Header>
        <HeaderContent>
          <div>
            <Title>API Keys</Title>
            <Subtitle>Manage your MCP API keys for LLM integration</Subtitle>
          </div>
        </HeaderContent>
      </Header>

      {/* Content */}
      <Content>
        {/* Error Message */}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {/* API Keys List */}
        <Card>
          <Section>
            <SectionHeader>
              <SectionTitle>Your API Keys</SectionTitle>
              <SectionSubtitle>
                {mcpApiKeys?.length || 0} key
                {(mcpApiKeys?.length || 0) !== 1 ? "s" : ""} total
              </SectionSubtitle>
            </SectionHeader>

            {!mcpApiKeys || mcpApiKeys.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🔑</EmptyIcon>
                <EmptyTitle>No API Keys</EmptyTitle>
              </EmptyState>
            ) : (
              <ApiKeyList>
                {mcpApiKeys?.map((apiKey) => (
                  <ApiKeyItem key={apiKey.id}>
                    <ApiKeyContent>
                      <ApiKeyHeader>
                        <ApiKeyName>{apiKey?.name || "Unnamed Key"}</ApiKeyName>
                        <StatusBadge $isActive={apiKey?.isActive ?? false}>
                          {apiKey?.isActive ? "Active" : "Revoked"}
                        </StatusBadge>
                      </ApiKeyHeader>

                      <ApiKeyDetails>
                        <ApiKeyRow>
                          <ApiKeyLabel>Key ID:</ApiKeyLabel>
                          <ApiKeyCode>{apiKey?.id || "Unknown"}</ApiKeyCode>
                        </ApiKeyRow>

                        <ApiKeyInfo>
                          <InfoText>
                            Created:{" "}
                            {apiKey?.createdAt
                              ? formatDate(apiKey.createdAt)
                              : "Unknown"}
                          </InfoText>
                          {apiKey?.lastUsed && (
                            <InfoText>
                              Last used: {formatDate(apiKey.lastUsed)}
                            </InfoText>
                          )}
                        </ApiKeyInfo>
                      </ApiKeyDetails>
                    </ApiKeyContent>

                    <ApiKeyActions>
                      {apiKey?.isActive && (
                        <RevokeButton
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          Revoke
                        </RevokeButton>
                      )}
                      <DeleteButton onClick={() => handleDeleteKey(apiKey.id)}>
                        Delete
                      </DeleteButton>
                    </ApiKeyActions>
                  </ApiKeyItem>
                ))}
              </ApiKeyList>
            )}
          </Section>
        </Card>

        {/* Usage Instructions */}
        <UsageInstructions>
          <InstructionTitle>🛠️ How to Use Your API Keys</InstructionTitle>
          <InstructionContent>
            <InstructionText>
              <strong>For LLM Integration:</strong> Include the API key in your
              requests:
            </InstructionText>
            <CodeBlock>X-MCP-API-Key: your_api_key_here</CodeBlock>
            <InstructionText>
              <strong>Endpoint:</strong>{" "}
              <InlineCode>http://localhost:3000/mcp</InlineCode>
            </InstructionText>
            <InstructionText>
              <strong>Protocol:</strong> JSON-RPC 2.0 over HTTP
            </InstructionText>
          </InstructionContent>
        </UsageInstructions>
      </Content>
    </Container>
  );
};

export default ApiKeysPage;
