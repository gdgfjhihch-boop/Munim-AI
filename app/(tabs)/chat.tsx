import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useChat } from '@/lib/chat-context';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';
import { llmService } from '@/lib/llm-service';
import { tavilyService } from '@/lib/tavily-service';
import { vectorDbService } from '@/lib/vector-db-service';
import { embeddingService } from '@/lib/embedding-service';
import { routeQuery } from '@/lib/router';

export default function ChatScreen() {
  const colors = useColors();
  const { state, addMessage, setLoading, toggleWebSearch } = useChat();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [state.messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInputText('');
    setLoading(true);
    setError(undefined);

    try {
      await llmService.initialize();
      await vectorDbService.initialize();
      await tavilyService.initialize();

      const documents = await vectorDbService.getAllDocuments();
      const decision = routeQuery(
        inputText,
        documents.length > 0,
        state.webSearchEnabled && tavilyService.isConfigured()
      );

      let context = '';
      let sources: string[] = [];

      if (decision.type === 'rag' && documents.length > 0) {
        try {
          const queryEmbedding = await embeddingService.embed(inputText);
          const results = await vectorDbService.searchSimilar(
            queryEmbedding.embedding,
            3,
            0.4
          );
          if (results.length > 0) {
            context = results
              .map(
                (r) =>
                  `Document: ${r.document.name}\nContent: ${r.document.content.substring(0, 200)}...`
              )
              .join('\n\n');
            sources = results.map((r) => r.document.name);
          }
        } catch (err) {
          console.error('RAG search failed:', err);
        }
      } else if (decision.type === 'web' && state.webSearchEnabled) {
        try {
          const searchResults = await tavilyService.search(inputText);
          context = searchResults
            .map((r) => `${r.title}\n${r.snippet}`)
            .join('\n\n');
          sources = searchResults.map((r) => r.url);
        } catch (err) {
          console.error('Web search failed:', err);
          setError('Web search failed. Please check your API key.');
        }
      }

      const systemPrompt = `You are GENESIS-1, a private AI assistant running entirely on the user's device.

Your core principles:
1. Privacy First: All conversations and data stay on the user's device.
2. Honesty: Be transparent about your limitations.
3. Helpfulness: Provide clear, concise, and actionable responses.
4. Respect: Treat the user with respect and acknowledge their concerns.

${context ? `Context from knowledge base:\n${context}` : ''}`;

      const response = await llmService.generateResponse(
        [...state.messages, userMessage],
        systemPrompt
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          response ||
          'I am GENESIS-1, your private AI assistant. How can I help you today?',
        timestamp: Date.now(),
        sources: sources.length > 0 ? sources : undefined,
      };
      addMessage(aiMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScreenContainer className="flex-1 justify-between p-0">
        {/* Header */}
        <View
          className="border-b"
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View className="mb-3">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.foreground }}
            >
              GENESIS-1
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Your Private AI Assistant
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs" style={{ color: colors.muted }}>
                Web Search
              </Text>
              <Switch
                value={state.webSearchEnabled}
                onValueChange={toggleWebSearch}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>
              {state.webSearchEnabled
                ? tavilyService.isConfigured()
                  ? '🟢 Ready'
                  : '🔴 No API Key'
                : '⚪ Off'}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {state.messages.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-4">
              <Text
                className="text-lg font-semibold text-center"
                style={{ color: colors.foreground }}
              >
                Welcome to GENESIS-1
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: colors.muted }}
              >
                Start a conversation. Your data stays private on your device.
              </Text>
            </View>
          ) : (
            state.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {error && (
            <View
              className="rounded-lg p-3 mb-3"
              style={{ backgroundColor: colors.error }}
            >
              <Text style={{ color: colors.background, fontSize: 12 }}>
                {error}
              </Text>
            </View>
          )}

          {state.isLoading && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.muted }}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          className="border-t p-4 flex-row gap-2"
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              maxHeight: 100,
            }}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!inputText.trim() || state.isLoading}
            style={({ pressed }) => [
              {
                backgroundColor: inputText.trim()
                  ? colors.primary
                  : colors.border,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: colors.background,
                fontWeight: '600',
              }}
            >
              Send
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const colors = useColors();
  const isUser = message.role === 'user';

  return (
    <View
      className={cn('flex-row', isUser ? 'justify-end' : 'justify-start')}
    >
      <View
        className="rounded-lg p-3 max-w-xs"
        style={{
          backgroundColor: isUser ? colors.primary : colors.surface,
        }}
      >
        <Text
          style={{
            color: isUser ? colors.background : colors.foreground,
          }}
        >
          {message.content}
        </Text>
        {message.sources && message.sources.length > 0 && (
          <Text
            className="text-xs mt-2"
            style={{
              color: isUser ? colors.background : colors.muted,
              opacity: 0.7,
            }}
          >
            Sources: {message.sources.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
}
