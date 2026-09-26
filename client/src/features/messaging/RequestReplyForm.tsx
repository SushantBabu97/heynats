import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { publishApi } from '@/lib/api';
import { emptyHeaders, HeadersEditor, toHeaderObject } from './HeadersEditor';

export function RequestReplyForm({ suggestions }: { suggestions: string[] }) {
  const [requestSubject, setRequestSubject] = useState('');
  const [requestData, setRequestData] = useState('');
  const [requestHeaders, setRequestHeaders] = useState(emptyHeaders);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [replySubject, setReplySubject] = useState('');

  const requestReplyMutation = useMutation({
    mutationFn: publishApi.requestReply,
  });

  const handleRequestReply = () =>
    requestReplyMutation.mutate({
      subject: requestSubject,
      data: requestData,
      timeout: timeoutSeconds,
      headers: toHeaderObject(requestHeaders),
      ...(replySubject && { reply_subject: replySubject }),
    });

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-medium text-foreground mb-4">
        Request-Reply Pattern
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="req-subject"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Subject *
          </label>
          <AutocompleteInput
            id="req-subject"
            value={requestSubject}
            onChange={setRequestSubject}
            suggestions={suggestions}
            placeholder="e.g., api.orders.get"
          />
        </div>

        <div>
          <label
            htmlFor="req-data"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Request Data *
          </label>
          <Textarea
            id="req-data"
            value={requestData}
            onChange={(e) => setRequestData(e.target.value)}
            placeholder='{"user_id": "12345"}'
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="req-timeout"
              className="block text-sm font-medium text-foreground/80 mb-1"
            >
              Timeout (seconds)
            </label>
            <Input
              id="req-timeout"
              type="number"
              value={timeoutSeconds}
              onChange={(e) =>
                setTimeoutSeconds(Number.parseInt(e.target.value) || 5)
              }
              min="1"
              max="60"
            />
          </div>

          <div>
            <label
              htmlFor="req-reply-subject"
              className="block text-sm font-medium text-foreground/80 mb-1"
            >
              Reply Subject (Optional)
            </label>
            <Input
              id="req-reply-subject"
              type="text"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              placeholder="Custom reply subject"
            />
          </div>
        </div>

        <HeadersEditor headers={requestHeaders} onChange={setRequestHeaders} />

        <div className="flex gap-2">
          <Button
            onClick={handleRequestReply}
            disabled={
              !requestSubject || !requestData || requestReplyMutation.isPending
            }
          >
            {requestReplyMutation.isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </div>

        {requestReplyMutation.data && (
          <div className="p-4 bg-success/5 border border-success/30 rounded-md">
            <h4 className="text-sm font-medium text-success mb-2">
              Response Received:
            </h4>
            <div className="text-xs space-y-1">
              <div>
                <strong>Reply Subject:</strong>{' '}
                {requestReplyMutation.data.reply_subject}
              </div>
              <div>
                <strong>Reply Data:</strong>
              </div>
              <pre className="bg-card p-2 rounded border text-xs overflow-x-auto">
                {requestReplyMutation.data.reply_data}
              </pre>
            </div>
          </div>
        )}

        {requestReplyMutation.error && (
          <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-md">
            <p className="text-sm text-destructive">
              Error: {requestReplyMutation.error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
