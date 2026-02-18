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
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useChat } from '@/lib/chat-context';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';

export default function ChatScreen() {
  const colors = useColors();
  const { state, addMessage, setLoading } = useChat();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [state.messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInputText('');
    setLoading(true);

    // Simulate AI response (will be replaced with actual LLM integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a placeholder response. LLM integration coming soon.',
        timestamp: Date.now(),
      };
      addMessage(aiMessage);
      setLoading(false);
    }, 1000);
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
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.foreground }}
          >
            GENESIS-1
          </Text>
          <Text
            className="text-sm"
            style={{ color: colors.muted }}
          >
            Your Private AI Assistant
          </Text>
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
                backgroundColor: inputText.trim() ? colors.primary : colors.border,
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
      className={cn(
        'flex-row',
        isUser ? 'justify-end' : 'justify-start'
      )}
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
