import {
  Archive,
  ArrowLeft,
  Clock,
  HardDrive,
  Hash,
  Key,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectionStatus } from '@/features/connection/useNATS';
import { formatBytes, formatTTL } from '@/lib/utils';
import { KVKeysTab } from './KVKeysTab';
import { useDeleteKVBucket, useKVBucket, useKVBucketKeys } from './useKV';

export function KVBucketDetailPage() {
  const { bucketName } = useParams<{ bucketName: string }>();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingKey, setIsAddingKey] = useState(false);

  // Check connection status
  const { data: connectionStatus } = useConnectionStatus();
  const isConnected = connectionStatus?.connected || false;

  // Fetch bucket data
  const {
    data: bucket,
    isLoading: bucketLoading,
    error: bucketError,
  } = useKVBucket(bucketName!, isConnected && !!bucketName);

  const {
    data: keysData,
    isLoading: keysLoading,
    error: keysError,
  } = useKVBucketKeys(bucketName!, isConnected && !!bucketName);

  // Mutations
  const deleteBucketMutation = useDeleteKVBucket();

  const keys = keysData?.items || [];

  // Filter keys based on search term

  const [confirmDeleteBucket, setConfirmDeleteBucket] = useState(false);
  const deleteBucket = () => {
    if (bucketName) {
      deleteBucketMutation.mutate(bucketName, {
        onSuccess: () => {
          navigate('/dashboard/kv');
        },
      });
    }
  };

  // Redirect if not connected
  if (!isConnected) {
    return (
      <div className="p-3">
        <div className="max-w-full">
          <Button
            onClick={() => navigate('/dashboard/kv')}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to KV Store
          </Button>

          <div className="bg-card rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <Key className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Connection Required
              </h3>
              <p className="text-gray-500 mb-6">
                Please connect to a NATS server to access Key-Value store
                features.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Connection Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (bucketLoading) {
    return (
      <div className="p-3">
        <div className="max-w-full">
          <Button
            onClick={() => navigate('/dashboard/kv')}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to KV Store
          </Button>

          <div className="bg-card rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Bucket
              </h3>
              <p className="text-gray-500">Fetching bucket details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (bucketError) {
    return (
      <div className="p-3">
        <div className="max-w-full">
          <Button
            onClick={() => navigate('/dashboard/kv')}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to KV Store
          </Button>

          <div className="bg-card rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-red-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Bucket
              </h3>
              <p className="text-gray-500 mb-6">
                Failed to load bucket details. The bucket may not exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-4">
          <Button
            onClick={() => navigate('/dashboard/kv')}
            variant="outline"
            size="sm"
            className="mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to KV Store
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{bucketName}</h2>
              <p className="text-sm text-gray-600">
                Key-Value bucket management
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  setIsAddingKey(true);
                  setActiveTab('keys');
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Key
              </Button>
              <Button
                onClick={() => setConfirmDeleteBucket(true)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Bucket
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="overview"
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keys">Keys ({keys.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {bucket && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatsCard
                  title="Total Keys"
                  value={bucket.values?.toLocaleString() || 'N/A'}
                  icon={<Hash className="w-4 h-4 text-indigo-600" />}
                />
                <StatsCard
                  title="Storage Used"
                  value={formatBytes(bucket.bytes)}
                  icon={<HardDrive className="w-4 h-4 text-indigo-600" />}
                />
                <StatsCard
                  title="History"
                  value={`${bucket.history} revisions`}
                  icon={<Archive className="w-4 h-4 text-indigo-600" />}
                />
                <StatsCard
                  title="TTL"
                  value={formatTTL(bucket.ttl)}
                  icon={<Clock className="w-4 h-4 text-indigo-600" />}
                />
              </div>
            )}

            {/* Bucket Configuration */}
            {bucket && (
              <div className="bg-card rounded-lg border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Configuration
                </h3>
                <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Storage Type
                    </dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {bucket.backing_store}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Compression
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {bucket.is_compressed ? 'Enabled' : 'Disabled'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      History per Key
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {bucket.history} revisions
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Time to Live
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatTTL(bucket.ttl)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setIsAddingKey(true);
                    setActiveTab('keys');
                  }}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Key
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('keys')}
                  className="flex items-center"
                >
                  <Key className="w-4 h-4 mr-2" />
                  View All Keys ({keys.length})
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Keys Tab */}
          <TabsContent value="keys" className="space-y-6">
            <KVKeysTab
              bucketName={bucketName!}
              keys={keys}
              keysLoading={keysLoading}
              keysError={keysError}
              isAddingKey={isAddingKey}
              setIsAddingKey={setIsAddingKey}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={confirmDeleteBucket}
        onOpenChange={setConfirmDeleteBucket}
        title="Delete bucket?"
        description={
          <>
            Bucket <strong>{bucketName}</strong> and all {keys.length} keys will
            be permanently deleted.
          </>
        }
        confirmLabel="Delete bucket"
        destructive
        onConfirm={deleteBucket}
      />
    </div>
  );
}
