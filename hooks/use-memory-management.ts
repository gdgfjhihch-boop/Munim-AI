import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { llmService } from '@/lib/llm-service';
import { useChat } from '@/lib/chat-context';

/**
 * Hook for aggressive memory management
 * Releases LLM from memory when app goes to background
 * Clears messages when needed to free up memory
 */
export function useMemoryManagement() {
  const { state, clearMessages } = useChat();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Release LLM from memory when app goes to background
      await llmService.releaseMemory();
      console.log('LLM released from memory');
    }
  };

  /**
   * Clear chat and release memory
   */
  const clearChatAndMemory = async () => {
    clearMessages();
    await llmService.releaseMemory();
  };

  /**
   * Get memory status
   */
  const getMemoryStatus = () => {
    return {
      llmStatus: llmService.getStatus(),
      messageCount: state.messages.length,
    };
  };

  return {
    clearChatAndMemory,
    getMemoryStatus,
  };
}
