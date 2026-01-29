import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, Send, User, Loader2, X, MessageCircle, Sparkles, Building2, Plus, History, Trash2, ChevronRight, Download, FileText, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { safeLocalStorage } from "@/lib/safeStorage";
import { 
  CHAT_RATE_LIMIT_MS, 
  MAX_CHAT_MESSAGE_LENGTH, 
  MIN_CHAT_MESSAGE_LENGTH,
  MAX_CHAT_HISTORY_MESSAGES,
  STORAGE_KEYS 
} from "@/lib/constants";
import { useChatConversations, ChatMessage } from "@/hooks/useChatConversations";
import { formatDistanceToNow } from "date-fns";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { exportChatToPDF, exportChatToText } from "@/lib/chatExport";

interface Position {
  x: number;
  y: number;
}

interface UserContext {
  businessName?: string;
  entityType?: string;
  sector?: string;
  turnover?: number;
}

const DEFAULT_POSITION: Position = { x: 24, y: 24 };

const getStoredPosition = (): Position => {
  const stored = safeLocalStorage.getJSON<Position | null>(STORAGE_KEYS.CHAT_POSITION, null);
  if (stored && typeof stored.x === "number" && typeof stored.y === "number") {
    return stored;
  }
  return DEFAULT_POSITION;
};

const savePosition = (pos: Position) => {
  safeLocalStorage.setJSON(STORAGE_KEYS.CHAT_POSITION, pos);
};

const SUGGESTED_QUESTIONS = [
  "What is the current VAT rate in Nigeria?",
  "When is CIT due for companies?",
  "How do I calculate PAYE?",
  "What items are VAT exempt?",
];

export function TaxAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<Position>(getStoredPosition);
  const [useContext, setUseContext] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<number>(0);
  
  const { savedBusinesses } = useSubscription();
  const primaryBusiness = savedBusinesses[0];

  const {
    conversations,
    currentConversation,
    currentConversationId,
    createConversation,
    updateMessages,
    deleteConversation,
    switchConversation,
  } = useChatConversations();

  // Local messages state for streaming
  const [streamingMessages, setStreamingMessages] = useState<ChatMessage[]>([]);
  
  // Sync messages from current conversation
  useEffect(() => {
    if (currentConversation) {
      setStreamingMessages(currentConversation.messages);
    } else {
      setStreamingMessages([]);
    }
  }, [currentConversation]);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingMessages]);

  // Unified drag handlers
  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartPos.current = { 
      x: clientX, 
      y: clientY, 
      posX: position.x, 
      posY: position.y 
    };
  }, [position]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !dragStartPos.current) return;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      hasMovedRef.current = true;
    }
    
    const newX = Math.max(8, Math.min(window.innerWidth - 64, dragStartPos.current.posX - deltaX));
    const newY = Math.max(8, Math.min(window.innerHeight - 64, dragStartPos.current.posY - deltaY));
    setPosition({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (hasMovedRef.current) {
      savePosition(position);
    }
    isDraggingRef.current = false;
    dragStartPos.current = null;
  }, [position]);

  const handleClick = useCallback(() => {
    if (!hasMovedRef.current) {
      setIsOpen(true);
    }
    hasMovedRef.current = false;
  }, []);

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      handlePointerUp();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Touch events
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => {
      handlePointerUp();
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handlePointerMove, handlePointerUp]);

  const streamChat = async (userMessages: ChatMessage[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tax-assistant`;

    let userContext: UserContext | undefined;
    if (useContext && primaryBusiness) {
      userContext = {
        businessName: primaryBusiness.name,
        entityType: primaryBusiness.entityType,
        turnover: primaryBusiness.turnover,
      };
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages, userContext }),
    });

    if (resp.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (resp.status === 402) {
      throw new Error("AI credits exhausted. Please try again later.");
    }
    if (!resp.ok || !resp.body) {
      throw new Error("Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setStreamingMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
    
    return assistantContent;
  };

  const handleNewChat = async () => {
    await createConversation();
    setShowHistory(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (conversationToDelete) {
      await deleteConversation(conversationToDelete);
      setConversationToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleExportPDF = () => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    try {
      exportChatToPDF(currentConversation);
      toast.success('Conversation exported as PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportText = () => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    try {
      exportChatToText(currentConversation);
      toast.success('Conversation exported as text file');
    } catch (error) {
      toast.error('Failed to export text file');
    }
  };

  const sendMessage = async (messageText?: string) => {
    const now = Date.now();
    if (now - lastSentRef.current < CHAT_RATE_LIMIT_MS) {
      toast.warning('Please wait a moment before sending another message');
      return;
    }

    let text = (messageText || input.trim()).slice(0, MAX_CHAT_MESSAGE_LENGTH);
    
    if (!text || isLoading) return;
    
    if (text.length < MIN_CHAT_MESSAGE_LENGTH) {
      toast.error('Please enter a longer question');
      return;
    }
    
    text = text.replace(/<[^>]*>/g, '');
    lastSentRef.current = now;

    // Create conversation if none exists
    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) {
        toast.error('Failed to create conversation');
        return;
      }
    }

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...streamingMessages, userMessage];
    setStreamingMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const assistantContent = await streamChat(newMessages);
      
      // Get final messages with assistant response
      const finalMessages: ChatMessage[] = [...newMessages, { role: "assistant", content: assistantContent }];
      
      // Save to database/localStorage (limit to MAX_CHAT_HISTORY_MESSAGES)
      const toSave = finalMessages.slice(-MAX_CHAT_HISTORY_MESSAGES);
      await updateMessages(convId, toSave, streamingMessages.length === 0);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleClick}
        onMouseDown={(e) => {
          e.preventDefault();
          handlePointerDown(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) {
            handlePointerDown(touch.clientX, touch.clientY);
          }
        }}
        className="fixed h-14 w-14 rounded-full shadow-lg bg-gradient-primary hover:opacity-90 z-50 select-none flex items-center justify-center text-white"
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
          cursor: "grab",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <MessageCircle className="h-6 w-6 pointer-events-none" />
      </button>
    );
  }

  return (
    <>
      <Card 
        className="fixed flex flex-col shadow-2xl z-50 border-primary/20"
        style={{
          right: "0.5rem",
          bottom: "0.5rem",
          left: "0.5rem",
          width: "auto",
          maxWidth: "380px",
          height: "min(65vh, 420px)",
          marginLeft: "auto",
        }}
      >
        <CardHeader className="bg-gradient-primary text-white rounded-t-lg py-2 px-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Popover open={showHistory} onOpenChange={setShowHistory}>
                <PopoverTrigger asChild>
                  <button 
                    className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    aria-label="View chat history"
                  >
                    <History className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-72 p-0" 
                  align="start" 
                  sideOffset={8}
                >
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Conversations</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNewChat}
                        className="h-7 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="max-h-64">
                    {conversations.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No conversations yet
                      </div>
                    ) : (
                      <div className="p-1">
                        {conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => {
                              switchConversation(conv.id);
                              setShowHistory(false);
                            }}
                            className={`w-full text-left p-2 rounded-md flex items-center gap-2 hover:bg-muted transition-colors group ${
                              conv.id === currentConversationId ? 'bg-muted' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conv.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                              aria-label="Delete conversation"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                            {conv.id === currentConversationId && (
                              <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <div>
                <CardTitle className="text-sm font-semibold">TaxBot</CardTitle>
                <p className="text-[10px] text-white/80">
                  {currentConversation ? currentConversation.title : 'Your AI Tax Assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-7 w-7"
                    disabled={!currentConversation || currentConversation.messages.length === 0}
                    aria-label="Export conversation"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportText}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Text
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="text-white hover:bg-white/20 h-7 w-7"
                aria-label="New chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-7 w-7"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Context Toggle */}
          {primaryBusiness && (
            <div className="px-3 py-2 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground truncate">
                    {useContext ? `Personalized for ${primaryBusiness.name}` : "Enable personalization"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="use-context" className="text-[10px] text-muted-foreground">
                    Context
                  </Label>
                  <Switch
                    id="use-context"
                    checked={useContext}
                    onCheckedChange={setUseContext}
                    className="scale-75"
                  />
                </div>
              </div>
            </div>
          )}
          
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            {streamingMessages.length === 0 ? (
              <div className="space-y-3">
                <div className="text-center py-2">
                  <Sparkles className="h-6 w-6 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Ask me anything about Nigerian taxes!
                  </p>
                  {useContext && primaryBusiness && (
                    <p className="text-[10px] text-primary mt-1">
                      Personalized for {primaryBusiness.name}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium">Try asking:</p>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-1.5 text-[11px]"
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {streamingMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && streamingMessages[streamingMessages.length - 1]?.role === "user" && (
                  <div className="flex gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-2 border-t bg-background rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Nigerian taxes..."
                disabled={isLoading}
                className="text-xs h-9"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-primary hover:bg-primary/90 h-9 w-9 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmLabel="Delete"
      />
    </>
  );
}
