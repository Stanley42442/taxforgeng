import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { safeLocalStorage } from '@/lib/safeStorage';
import { STORAGE_KEYS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

const MAX_GUEST_CONVERSATIONS = 10;

// Generate title from first message
const generateTitle = (message: string): string => {
  const cleanMessage = message.replace(/<[^>]*>/g, '').trim();
  if (cleanMessage.length <= 40) return cleanMessage;
  return cleanMessage.slice(0, 40) + '...';
};

export function useChatConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from database or localStorage
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Authenticated: load from database
        const { data, error } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        const mapped = (data || []).map((conv) => ({
          id: conv.id,
          title: conv.title,
          messages: (Array.isArray(conv.messages) ? conv.messages : []) as unknown as ChatMessage[],
          created_at: conv.created_at,
          updated_at: conv.updated_at,
        }));
        
        setConversations(mapped);
        
        // Restore current conversation ID
        const savedId = safeLocalStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
        if (savedId && mapped.some(c => c.id === savedId)) {
          setCurrentConversationId(savedId);
        } else if (mapped.length > 0) {
          setCurrentConversationId(mapped[0].id);
        }
      } else {
        // Guest: load from localStorage
        const saved = safeLocalStorage.getJSON<ChatConversation[]>(
          STORAGE_KEYS.GUEST_CONVERSATIONS,
          []
        );
        setConversations(saved);
        
        const savedId = safeLocalStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
        if (savedId && saved.some(c => c.id === savedId)) {
          setCurrentConversationId(savedId);
        } else if (saved.length > 0) {
          setCurrentConversationId(saved[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Save current conversation ID
  useEffect(() => {
    if (currentConversationId) {
      safeLocalStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, currentConversationId);
    }
  }, [currentConversationId]);

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId) || null;

  // Create new conversation
  const createConversation = useCallback(async (): Promise<string | null> => {
    try {
      const newId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const newConv: ChatConversation = {
        id: newId,
        title: 'New Chat',
        messages: [],
        created_at: now,
        updated_at: now,
      };

      if (user) {
        // Authenticated: save to database
        const { error } = await supabase
          .from('chat_conversations')
          .insert({
            id: newId,
            user_id: user.id,
            title: 'New Chat',
            messages: [],
          });

        if (error) throw error;
      } else {
        // Guest: save to localStorage
        const existing = safeLocalStorage.getJSON<ChatConversation[]>(
          STORAGE_KEYS.GUEST_CONVERSATIONS,
          []
        );
        
        // Limit guest conversations
        const limited = existing.slice(0, MAX_GUEST_CONVERSATIONS - 1);
        safeLocalStorage.setJSON(STORAGE_KEYS.GUEST_CONVERSATIONS, [newConv, ...limited]);
      }

      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(newId);
      return newId;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }, [user]);

  // Update conversation messages
  const updateMessages = useCallback(async (
    conversationId: string,
    messages: ChatMessage[],
    autoTitle?: boolean
  ) => {
    try {
      const title = autoTitle && messages.length > 0 && messages[0].role === 'user'
        ? generateTitle(messages[0].content)
        : undefined;

      if (user) {
        // Authenticated: update database
        const updateData: Record<string, unknown> = { messages };
        if (title) updateData.title = title;

        const { error } = await supabase
          .from('chat_conversations')
          .update(updateData)
          .eq('id', conversationId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Guest: update localStorage
        const existing = safeLocalStorage.getJSON<ChatConversation[]>(
          STORAGE_KEYS.GUEST_CONVERSATIONS,
          []
        );
        
        const updated = existing.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages,
              title: title || c.title,
              updated_at: new Date().toISOString(),
            };
          }
          return c;
        });
        
        safeLocalStorage.setJSON(STORAGE_KEYS.GUEST_CONVERSATIONS, updated);
      }

      // Update local state
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages,
            title: title || c.title,
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Failed to update messages:', error);
    }
  }, [user]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('chat_conversations')
          .delete()
          .eq('id', conversationId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const existing = safeLocalStorage.getJSON<ChatConversation[]>(
          STORAGE_KEYS.GUEST_CONVERSATIONS,
          []
        );
        const filtered = existing.filter(c => c.id !== conversationId);
        safeLocalStorage.setJSON(STORAGE_KEYS.GUEST_CONVERSATIONS, filtered);
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If deleting current, switch to another
      if (currentConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }, [user, currentConversationId, conversations]);

  // Switch conversation
  const switchConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
  }, []);

  return {
    conversations,
    currentConversation,
    currentConversationId,
    isLoading,
    createConversation,
    updateMessages,
    deleteConversation,
    switchConversation,
    refreshConversations: loadConversations,
  };
}
