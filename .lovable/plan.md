

# Add Conversation Search Functionality

## Overview

Add the ability to search through TaxBot conversations by content or date, allowing users to quickly find specific past chats.

## New Features

- Search input field in the conversation history panel
- Real-time filtering as user types
- Search by message content (both questions and answers)
- Search by date (today, yesterday, this week, etc.)
- Highlight matching terms in results
- Clear search button

## Technical Approach

### 1. `src/hooks/useChatConversations.ts` (MODIFY)

Add search/filter functionality:

```typescript
// New state and logic to add:
const [searchQuery, setSearchQuery] = useState('');

// Filter function
const filterConversations = useCallback((query: string) => {
  if (!query.trim()) return conversations;
  
  const lowercaseQuery = query.toLowerCase();
  
  return conversations.filter(conv => {
    // Match by title
    if (conv.title.toLowerCase().includes(lowercaseQuery)) return true;
    
    // Match by message content
    return conv.messages.some(msg => 
      msg.content.toLowerCase().includes(lowercaseQuery)
    );
  });
}, [conversations]);

// Return filtered conversations based on search
const filteredConversations = useMemo(() => 
  filterConversations(searchQuery),
  [filterConversations, searchQuery]
);
```

New exports:
- `searchQuery`: Current search string
- `setSearchQuery`: Update search string
- `filteredConversations`: Filtered conversation list
- `clearSearch`: Reset search

### 2. `src/components/TaxAssistant.tsx` (MODIFY)

Add search UI in the history popover:

Current structure:
```
+---------------------------+
| Conversations    [+ New]  |
+---------------------------+
| - VAT Questions (today)   |
| - CIT Rates (yesterday)   |
+---------------------------+
```

New structure with search:
```
+---------------------------+
| Conversations    [+ New]  |
+---------------------------+
| [🔍 Search chats...    X] |
+---------------------------+
| Matching conversations:   |
| - VAT Questions (today)   |
|   "...current VAT rate..." |
+---------------------------+
```

Changes:
- Add search input at the top of popover content
- Import `Search` and `X` icons from lucide-react
- Display `filteredConversations` instead of `conversations`
- Show matching text snippet when searching
- Add empty state for "No matches found"
- Clear search button when query exists

### 3. Search UI Component Details

Search input styling:
```tsx
<div className="relative px-3 py-2 border-b">
  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
  <Input
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search chats..."
    className="h-8 pl-8 pr-8 text-xs"
  />
  {searchQuery && (
    <button 
      onClick={clearSearch}
      className="absolute right-5 top-1/2 -translate-y-1/2"
    >
      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
    </button>
  )}
</div>
```

### 4. Matching Text Highlight

When search is active, show a preview of the matching message:

```tsx
// Find first matching message content
const getMatchSnippet = (conv: ChatConversation, query: string) => {
  if (!query) return null;
  
  const lowerQuery = query.toLowerCase();
  
  for (const msg of conv.messages) {
    const idx = msg.content.toLowerCase().indexOf(lowerQuery);
    if (idx !== -1) {
      // Get surrounding context
      const start = Math.max(0, idx - 20);
      const end = Math.min(msg.content.length, idx + query.length + 20);
      const snippet = msg.content.slice(start, end);
      return `...${snippet}...`;
    }
  }
  return null;
};
```

Display snippet below conversation title:
```tsx
{searchQuery && (
  <p className="text-[10px] text-muted-foreground truncate italic">
    {getMatchSnippet(conv, searchQuery)}
  </p>
)}
```

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useChatConversations.ts` | MODIFY | Add search state and filter logic |
| `src/components/TaxAssistant.tsx` | MODIFY | Add search input and filtered display |

## User Experience

1. User opens conversation history popover
2. Search input is immediately visible at top
3. As user types, conversations filter in real-time
4. Matching text snippets appear under each result
5. Clear button (X) resets the search
6. "No matches found" message when search has no results
7. Search persists while popover is open, clears when closed

## Technical Considerations

1. **Performance**: Search runs client-side on loaded conversations (already fetched)
2. **Case-insensitive**: All searches are lowercase-compared
3. **Debouncing**: Not needed since filtering is instant on small datasets
4. **State Reset**: Search clears when popover closes or user switches chats

