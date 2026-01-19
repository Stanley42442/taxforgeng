import { useState, useCallback } from 'react';
import { 
  addToSyncQueue, 
  getSyncQueue, 
  removeFromSyncQueue,
  clearSyncQueue,
  getConflicts,
  resolveConflict as resolveConflictInDb,
  PendingAction,
  SyncConflict,
} from '@/lib/offlineStorage';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useOfflineStatus } from './useOfflineStatus';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
}

export interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  conflictCount: number;
  conflicts: SyncConflict[];
  queueAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  syncNow: () => Promise<SyncResult>;
  cancelPendingAction: (id: string) => Promise<void>;
  resolveConflict: (id: string, resolution: 'local' | 'server') => Promise<void>;
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const { isOnline } = useOfflineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const refreshCounts = useCallback(async () => {
    const queue = await getSyncQueue();
    setPendingSyncCount(queue.length);
    const conflictList = await getConflicts();
    setConflicts(conflictList);
  }, []);

  const queueAction = useCallback(async (
    action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>
  ) => {
    const pendingAction: PendingAction = {
      ...action,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await addToSyncQueue(pendingAction);
    await refreshCounts();
  }, [refreshCounts]);

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline) {
      return { success: false, synced: 0, failed: 0, conflicts: 0 };
    }

    setIsSyncing(true);
    const result: SyncResult = { success: true, synced: 0, failed: 0, conflicts: 0 };

    try {
      const queue = await getSyncQueue();
      
      for (const action of queue) {
        try {
          // Process each action based on table and action type
          const { table, action: actionType, data } = action;
          const record = data as Record<string, unknown>;
          const recordId = record.id as string;
          
          // Use type assertion to bypass strict table typing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tableRef = supabase.from(table as any);
          
          if (actionType === 'create') {
            const { error } = await tableRef.insert([record] as any);
            if (error) throw error;
          } else if (actionType === 'update') {
            const { error } = await tableRef.update(record as any).eq('id', recordId);
            if (error) throw error;
          } else if (actionType === 'delete') {
            const { error } = await tableRef.delete().eq('id', recordId);
            if (error) throw error;
          }
          
          await removeFromSyncQueue(action.id);
          result.synced++;
        } catch (error) {
          console.error('[OfflineSync] Failed to sync action:', error);
          result.failed++;
        }
      }

      await refreshCounts();
    } finally {
      setIsSyncing(false);
    }

    return result;
  }, [isOnline, refreshCounts]);

  const cancelPendingAction = useCallback(async (id: string) => {
    await removeFromSyncQueue(id);
    await refreshCounts();
  }, [refreshCounts]);

  const resolveConflict = useCallback(async (id: string, resolution: 'local' | 'server') => {
    // Handle resolution logic here
    await resolveConflictInDb(id);
    await refreshCounts();
  }, [refreshCounts]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0) {
      syncNow();
    }
  }, [isOnline, pendingSyncCount, syncNow]);

  return {
    isOnline,
    isSyncing,
    pendingSyncCount,
    conflictCount: conflicts.length,
    conflicts,
    queueAction,
    syncNow,
    cancelPendingAction,
    resolveConflict,
  };
};
