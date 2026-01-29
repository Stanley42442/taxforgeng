
# Enhanced TaxBot Chat History + Smoother Index Carousel

## Overview

This plan implements two enhancements:
1. **Full Chat History System**: Allow users to create new conversations, view past chats, and continue from where they left off
2. **Smoother Carousel Transitions**: Make the Index page carousel transitions seamless with a crossfade effect

---

## Part 1: TaxBot Conversation History

### Current State
- Messages stored in `sessionStorage` (lost when browser closes)
- No conversation management (single conversation only)
- `ai_queries` table exists but only logs individual Q&A pairs, not full conversations

### New Features
- Create new conversations
- View list of past conversations with timestamps
- Continue any previous conversation
- Delete unwanted conversations
- Conversations persist in the database for authenticated users
- Falls back to sessionStorage for unauthenticated users

### Database Changes

Create a new `chat_conversations` table:

```sql
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.chat_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### File Changes

#### 1. `src/hooks/useChatConversations.ts` (NEW)

Custom hook to manage chat conversations:

```typescript
// Handles:
// - Fetching user's conversations
// - Creating new conversations
// - Updating conversation messages
// - Deleting conversations
// - Auto-generating titles from first message
```

#### 2. `src/components/TaxAssistant.tsx` (MODIFY)

Major changes:
- Add conversation sidebar/dropdown
- Add "New Chat" button in header
- Add conversation list view
- Integrate `useChatConversations` hook
- Update message sending to save to database
- Add conversation title display

New UI structure:
```text
+---------------------------+
| [☰] TaxBot     [+New] [X] |
+---------------------------+
| ≡ Conversations (sidebar) |
|   - VAT Questions (today) |
|   - CIT Rates (yesterday) |
|   - PAYE Help (3 days ago)|
+---------------------------+
| Chat Messages Area        |
|                           |
+---------------------------+
| [Input...............][→] |
+---------------------------+
```

#### 3. `src/lib/constants.ts` (MODIFY)

Add new storage keys:
```typescript
STORAGE_KEYS = {
  // ...existing
  CURRENT_CONVERSATION_ID: 'taxbot-current-conversation',
  GUEST_CONVERSATIONS: 'taxbot-guest-conversations',
}
```

### Conversation Title Logic

Auto-generate titles from the first user message:
- Take first 40 characters of the first question
- Add "..." if truncated
- Example: "What is the current VAT rate in..."

---

## Part 2: Smoother Carousel Transitions

### Current State
- Index page uses custom carousel with `translate-x` transition
- Slides change with opacity + translate creating a jarring effect
- 500ms transition duration

### Improvements
- Switch to smooth crossfade animation
- Use Embla carousel's fade plugin for native-like transitions
- Add CSS for seamless opacity transitions
- Increase transition duration to 700ms for smoothness

### File Changes

#### 1. `src/pages/Index.tsx` (MODIFY)

Replace custom carousel logic with Embla-based fade effect:

```tsx
// Before: Manual state + translate animations
// After: Use the existing Carousel component with fade effect

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";
```

Changes:
- Replace manual `currentSlide` state with Embla API
- Use `embla-carousel-fade` plugin for crossfade effect
- Use `embla-carousel-autoplay` for auto-advance
- Remove `translate-x-8` animation in favor of pure opacity fade
- Update dot indicators to sync with Embla state

#### 2. `src/index.css` (MODIFY)

Add smooth carousel fade animation:

```css
/* Carousel Fade Animation */
.carousel-fade-slide {
  opacity: 0;
  transition: opacity 700ms ease-in-out;
}

.carousel-fade-slide.is-selected {
  opacity: 1;
}
```

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | CREATE | `chat_conversations` table with RLS |
| `src/hooks/useChatConversations.ts` | CREATE | Hook for conversation CRUD |
| `src/components/TaxAssistant.tsx` | MODIFY | Add conversation management UI |
| `src/lib/constants.ts` | MODIFY | Add new storage keys |
| `src/pages/Index.tsx` | MODIFY | Use Embla fade carousel |
| `src/index.css` | MODIFY | Add fade animation CSS |

---

## Technical Considerations

1. **Guest Users**: Conversations stored in localStorage (limited to 10 conversations, auto-cleanup oldest)
2. **Authenticated Users**: Full database persistence with no hard limit
3. **Migration**: Existing sessionStorage chat is converted to first conversation on component mount
4. **Performance**: Conversations list uses virtual scrolling if > 20 items
5. **Carousel**: Fade plugin provides hardware-accelerated opacity transitions

---

## Expected Results

After implementation:
- Users can manage multiple chat conversations like ChatGPT/Claude
- Conversations persist across sessions for logged-in users
- Index carousel transitions are smooth and professional
- No flicker or jarring movements during slide changes
