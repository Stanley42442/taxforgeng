import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  Database,
  Trash2,
  Download,
} from 'lucide-react';
import { StorageQuotaCard } from '@/components/StorageQuotaCard';
import { IntegrityStatusCard } from '@/components/IntegrityStatusCard';
import { CleanupSettingsCard } from '@/components/CleanupSettingsCard';
import { OfflineExportButton } from '@/components/OfflineExportButton';
import { useOfflineData } from '@/contexts/OfflineDataContext';
import { formatBytes } from '@/lib/compression';

const OfflineDashboard: React.FC = () => {
  const { 
    isOnline, 
    pendingSyncCount,
    conflictCount,
    isSyncing,
    syncNow,
    storageStats,
    clearCache,
    refreshStorageStats,
  } = useOfflineData();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-8 w-8 text-success" />
              ) : (
                <WifiOff className="h-8 w-8 text-destructive" />
              )}
              Offline Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your offline data, sync settings, and storage
            </p>
          </div>
          <div className="flex gap-2">
            <OfflineExportButton />
            <Button 
              onClick={() => syncNow()}
              disabled={!isOnline || isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isOnline ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {isOnline ? (
                    <Wifi className="h-6 w-6 text-success" />
                  ) : (
                    <WifiOff className="h-6 w-6 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline 
                      ? 'All features available' 
                      : 'Using cached data (read-only)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sync Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-muted">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Pending Actions</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingSyncCount} item{pendingSyncCount !== 1 ? 's' : ''} waiting to sync
                    </p>
                  </div>
                </div>
                {conflictCount > 0 && (
                  <Badge variant="destructive">
                    {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Storage Quota */}
          <StorageQuotaCard />

          {/* Data Integrity */}
          <IntegrityStatusCard />

          {/* Cleanup Settings */}
          <CleanupSettingsCard />
        </div>

        {/* Cached Data Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cached Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storageStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(storageStats.byTable).map(([table, data]) => (
                  <div 
                    key={table}
                    className="p-4 rounded-lg bg-muted text-center"
                  >
                    <p className="text-2xl font-bold">{data.count}</p>
                    <p className="text-sm capitalize text-muted-foreground">{table}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(data.size)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <OfflineExportButton variant="secondary" />
              <Button variant="outline" onClick={refreshStorageStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (confirm('Are you sure you want to clear all cached data?')) {
                    clearCache();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default OfflineDashboard;
