import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { publishApi } from '@/lib/api';
import { emptyHeaders, HeadersEditor, toHeaderObject } from './HeadersEditor';

export function SinglePublishForm({ suggestions }: { suggestions: string[] }) {
  const [subject, setSubject] = useState('');
  const [data, setData] = useState('');
  const [headers, setHeaders] = useState(emptyHeaders);

  const publishMutation = useMutation({
    mutationFn: publishApi.publishMessage,
    onSuccess: () => {
      setSubject('');
      setData('');
      setHeaders(emptyHeaders());
    },
  });

  const handlePublishMessage = () =>
    publishMutation.mutate({ subject, data, headers: toHeaderObject(headers) });

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-medium text-foreground mb-4">
        Publish Single Message
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="pub-subject"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Subject *
          </label>
          <AutocompleteInput
            id="pub-subject"
            value={subject}
            onChange={setSubject}
            suggestions={suggestions}
            placeholder="e.g., events.user.created"
          />
        </div>

        <div>
          <label
            htmlFor="pub-message-data"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Message Data *
          </label>
          <Textarea
            id="pub-message-data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder='{"message": "Hello, World!", "timestamp": "2024-01-01T00:00:00Z"}'
            className="min-h-[120px]"
          />
        </div>

        <HeadersEditor headers={headers} onChange={setHeaders} />

        <div className="flex gap-2">
          <Button
            onClick={handlePublishMessage}
            disabled={!subject || !data || publishMutation.isPending}
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish Message'}
          </Button>
        </div>

        {publishMutation.data && (
          <div className="p-4 bg-success/5 border border-success/30 rounded-md">
            <p className="text-sm text-success">
              Message published successfully to subject:{' '}
              {publishMutation.data.subject}
            </p>
          </div>
        )}

        {publishMutation.error && (
          <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-md">
            <p className="text-sm text-destructive">
              Error: {publishMutation.error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
