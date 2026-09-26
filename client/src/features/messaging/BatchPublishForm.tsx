import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type PublishMessage, publishApi } from '@/lib/api';

const emptyMessage = (): PublishMessage => ({
  subject: '',
  data: '',
  headers: {},
});

export function BatchPublishForm({ suggestions }: { suggestions: string[] }) {
  const [batchMessages, setBatchMessages] = useState(() => [emptyMessage()]);

  const batchPublishMutation = useMutation({
    mutationFn: publishApi.publishBatch,
    onSuccess: () => setBatchMessages([emptyMessage()]),
  });

  const updateBatchMessage = (
    index: number,
    field: 'subject' | 'data',
    value: string
  ) =>
    setBatchMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, [field]: value } : msg))
    );

  const handleBatchPublish = () => {
    const validMessages = batchMessages.filter((m) => m.subject && m.data);
    if (validMessages.length === 0) return;
    batchPublishMutation.mutate({ messages: validMessages });
  };

  return (
    <div className="bg-card rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Publish Batch Messages
      </h3>

      <div className="space-y-4">
        {batchMessages.map((message, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Message {index + 1}
              </h4>
              {batchMessages.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBatchMessages((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`batch-subject-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject *
                </label>
                <AutocompleteInput
                  id={`batch-subject-${index}`}
                  value={message.subject}
                  onChange={(value) =>
                    updateBatchMessage(index, 'subject', value)
                  }
                  suggestions={suggestions}
                  placeholder="e.g., events.user.created"
                />
              </div>
              <div>
                <label
                  htmlFor={`batch-data-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message Data *
                </label>
                <Textarea
                  id={`batch-data-${index}`}
                  value={message.data}
                  onChange={(e) =>
                    updateBatchMessage(index, 'data', e.target.value)
                  }
                  placeholder="Message content"
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setBatchMessages((prev) => [...prev, emptyMessage()])
            }
          >
            Add Message
          </Button>
          <Button
            onClick={handleBatchPublish}
            disabled={
              batchMessages.every((m) => !m.subject || !m.data) ||
              batchPublishMutation.isPending
            }
          >
            {batchPublishMutation.isPending ? 'Publishing...' : 'Publish Batch'}
          </Button>
        </div>

        {batchPublishMutation.data && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 mb-2">
              Batch publish completed: {batchPublishMutation.data.succeeded}/
              {batchPublishMutation.data.total} successful
            </p>
            {batchPublishMutation.data.results.map((result, index) => (
              <div key={index} className="text-xs text-green-700">
                {result.subject}:{' '}
                {result.success ? 'Success' : `Failed - ${result.error}`}
              </div>
            ))}
          </div>
        )}

        {batchPublishMutation.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Error: {batchPublishMutation.error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
