import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Header {
  key: string;
  value: string;
}

export const emptyHeaders = (): Header[] => [{ key: '', value: '' }];

// Rows with an empty key or value are dropped; undefined when nothing is left.
export function toHeaderObject(headers: Header[]) {
  const entries = headers
    .filter((h) => h.key && h.value)
    .map((h) => [h.key, h.value]);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function HeadersEditor({
  headers,
  onChange,
}: {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}) {
  const update = (index: number, field: keyof Header, value: string) =>
    onChange(
      headers.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );

  return (
    <div>
      <p className="block text-sm font-medium text-foreground/80 mb-1">
        Headers (Optional)
      </p>
      <div className="space-y-2">
        {headers.map((header, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="text"
              aria-label={`Header ${index + 1} key`}
              value={header.key}
              onChange={(e) => update(index, 'key', e.target.value)}
              placeholder="Header key"
              className="flex-1"
            />
            <Input
              type="text"
              aria-label={`Header ${index + 1} value`}
              value={header.value}
              onChange={(e) => update(index, 'value', e.target.value)}
              placeholder="Header value"
              className="flex-1"
            />
            {headers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove header ${index + 1}`}
                onClick={() => onChange(headers.filter((_, i) => i !== index))}
              >
                <X />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...headers, { key: '', value: '' }])}
        className="mt-2"
      >
        Add Header
      </Button>
    </div>
  );
}
