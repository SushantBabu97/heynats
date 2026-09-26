import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { CreateBucketRequest } from '@/lib/api';

interface CreateBucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: CreateBucketRequest) => void;
  isLoading: boolean;
}

export function CreateBucketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateBucketModalProps) {
  const [formData, setFormData] = useState<CreateBucketRequest>({
    bucket: '',
    history: 1,
    ttl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bucket.trim()) {
      newErrors.bucket = 'Bucket name is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.bucket)) {
      newErrors.bucket =
        'Bucket name can only contain letters, numbers, hyphens, and underscores';
    }

    if (
      formData.history !== undefined &&
      (formData.history < 1 || formData.history > 64)
    ) {
      newErrors.history = 'History must be between 1 and 64';
    }

    if (formData.ttl && formData.ttl.trim()) {
      // Basic TTL format validation (Go duration format)
      const ttlRegex = /^(\d+(\.\d+)?(ns|us|µs|ms|s|m|h))+$/;
      if (!ttlRegex.test(formData.ttl.trim())) {
        newErrors.ttl =
          'Invalid TTL format. Use Go duration format (e.g., 60s, 5m, 1h30m)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const config: CreateBucketRequest = {
        bucket: formData.bucket.trim(),
      };

      if (formData.history !== undefined && formData.history !== 1) {
        config.history = formData.history;
      }

      if (formData.ttl && formData.ttl.trim()) {
        config.ttl = formData.ttl.trim();
      }

      onSubmit(config);
    }
  };

  const handleClose = () => {
    setFormData({ bucket: '', history: 1, ttl: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && handleClose()}
    >
      <DialogContent aria-describedby={undefined} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create KV Bucket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="kv-bucket"
              className="block text-sm font-medium text-foreground/80 mb-1"
            >
              Bucket Name *
            </label>
            <Input
              id="kv-bucket"
              type="text"
              value={formData.bucket}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bucket: e.target.value }))
              }
              placeholder="my-bucket"
              className={errors.bucket ? 'border-destructive/30' : ''}
              disabled={isLoading}
            />
            {errors.bucket && (
              <p className="text-destructive text-sm mt-1">{errors.bucket}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="kv-history"
              className="block text-sm font-medium text-foreground/80 mb-1"
            >
              History (revisions per key)
            </label>
            <Input
              id="kv-history"
              type="number"
              min="1"
              max="64"
              value={formData.history}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  history: Number.parseInt(e.target.value) || 1,
                }))
              }
              className={errors.history ? 'border-destructive/30' : ''}
              disabled={isLoading}
            />
            {errors.history && (
              <p className="text-destructive text-sm mt-1">{errors.history}</p>
            )}
            <p className="text-muted-foreground text-xs mt-1">
              Number of historical values to keep per key (1-64)
            </p>
          </div>

          <div>
            <label
              htmlFor="kv-ttl"
              className="block text-sm font-medium text-foreground/80 mb-1"
            >
              TTL (Time To Live)
            </label>
            <Input
              id="kv-ttl"
              type="text"
              value={formData.ttl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ttl: e.target.value }))
              }
              placeholder="60s, 5m, 1h30m (optional)"
              className={errors.ttl ? 'border-destructive/30' : ''}
              disabled={isLoading}
            />
            {errors.ttl && (
              <p className="text-destructive text-sm mt-1">{errors.ttl}</p>
            )}
            <p className="text-muted-foreground text-xs mt-1">
              Optional expiration time for keys (Go duration format)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Creating...' : 'Create Bucket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
