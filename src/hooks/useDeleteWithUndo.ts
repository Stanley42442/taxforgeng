import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface DeleteWithUndoOptions<T> {
  /** Function to delete the item (called after undo timeout) */
  onDelete: (item: T) => void | Promise<void>;
  /** Function to restore the item if undo is clicked */
  onRestore?: (item: T) => void | Promise<void>;
  /** Duration in ms before permanent deletion (default: 5000) */
  undoDuration?: number;
  /** Toast message formatter */
  getSuccessMessage: (item: T) => string;
  /** Item name formatter for the toast */
  getItemName?: (item: T) => string;
}

interface UseDeleteWithUndoReturn<T> {
  /** The item pending deletion (for UI updates) */
  pendingItem: T | null;
  /** Whether the delete confirmation dialog should be shown */
  showDialog: boolean;
  /** Item to delete (stored for dialog) */
  itemToDelete: T | null;
  /** Open the delete confirmation dialog */
  requestDelete: (item: T) => void;
  /** Confirm deletion from dialog (starts undo timer) */
  confirmDelete: () => void;
  /** Cancel the delete dialog */
  cancelDelete: () => void;
  /** Check if an item is pending deletion */
  isPending: (item: T) => boolean;
}

export function useDeleteWithUndo<T extends { id: string }>(
  options: DeleteWithUndoOptions<T>
): UseDeleteWithUndoReturn<T> {
  const {
    onDelete,
    onRestore,
    undoDuration = 5000,
    getSuccessMessage,
    getItemName,
  } = options;

  const [showDialog, setShowDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [pendingItem, setPendingItem] = useState<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const requestDelete = useCallback((item: T) => {
    setItemToDelete(item);
    setShowDialog(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setShowDialog(false);
    setItemToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    const item = itemToDelete;
    setPendingItem(item);
    setShowDialog(false);
    setItemToDelete(null);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show toast with undo button
    toast(getSuccessMessage(item), {
      action: {
        label: "Undo",
        onClick: () => {
          // Clear the pending deletion
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setPendingItem(null);
          
          // Restore the item if handler provided
          if (onRestore) {
            onRestore(item);
          }
          
          const itemName = getItemName ? getItemName(item) : "Item";
          toast.success(`${itemName} restored`);
        },
      },
      duration: undoDuration,
    });

    // Set timeout for permanent deletion
    timeoutRef.current = setTimeout(async () => {
      await onDelete(item);
      setPendingItem(null);
      timeoutRef.current = null;
    }, undoDuration);
  }, [itemToDelete, onDelete, onRestore, undoDuration, getSuccessMessage, getItemName]);

  const isPending = useCallback(
    (item: T) => pendingItem?.id === item.id,
    [pendingItem]
  );

  return {
    pendingItem,
    showDialog,
    itemToDelete,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isPending,
  };
}
