import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Message, ChatState } from './types';

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'TOGGLE_WEB_SEARCH' }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string } };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: undefined,
  webSearchEnabled: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'TOGGLE_WEB_SEARCH':
      return {
        ...state,
        webSearchEnabled: !state.webSearchEnabled,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content }
            : msg
        ),
      };
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  toggleWebSearch: () => void;
  clearMessages: () => void;
  updateMessage: (id: string, content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const value: ChatContextType = {
    state,
    addMessage: (message) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    toggleWebSearch: () => dispatch({ type: 'TOGGLE_WEB_SEARCH' }),
    clearMessages: () => dispatch({ type: 'CLEAR_MESSAGES' }),
    updateMessage: (id, content) => dispatch({ type: 'UPDATE_MESSAGE', payload: { id, content } }),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
