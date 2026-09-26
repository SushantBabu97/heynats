import { Edit2, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { ContextForm } from './ContextForm';
import type { NATSContext } from './types';
import { useNATSContexts } from './useNATSContexts';

interface ContextManagerProps {
  onSelectContext?: (context: NATSContext) => void;
  onClose?: () => void;
}

export function ContextManager({
  onSelectContext,
  onClose,
}: ContextManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const {
    contexts,
    isLoading,
    error,
    deleteContext,
    setDefaultContext,
    refreshContexts,
  } = useNATSContexts();

  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleConfirmDelete = async (id: string) => {
    await deleteContext(id);
    setShowDeleteConfirm(null);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultContext(id);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    refreshContexts();
  };

  const handleSelectContext = (context: NATSContext) => {
    if (onSelectContext) {
      onSelectContext(context);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleEditClick = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contexts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/5 border border-destructive/30 rounded-md p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {showForm ? (
        <ContextForm editingId={editingId} onClose={handleFormClose} />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              Saved Contexts
            </h3>
            <Button
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              type="button"
            >
              <Plus className="w-4 h-4" />
              New Context
            </Button>
          </div>

          {contexts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No contexts saved yet
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                type="button"
              >
                Create Your First Context
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {contexts.map((context) => (
                <div
                  key={context.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <button
                    className="flex-1 cursor-pointer text-left p-0 border-0 bg-transparent hover:bg-transparent"
                    onClick={() => handleSelectContext(context)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">
                        {context.name}
                      </h4>
                      {context.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {context.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {context.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {context.host}:{context.port}
                      {context.username && ` (${context.username})`}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    {!context.isDefault && (
                      <button
                        onClick={() => handleSetDefault(context.id)}
                        className="p-2 text-muted-foreground hover:text-warning rounded"
                        title="Set as default"
                        aria-label="Set as default context"
                        type="button"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEditClick(context.id)}
                      className="p-2 text-muted-foreground hover:text-primary rounded"
                      title="Edit context"
                      aria-label="Edit context"
                      type="button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(context.id)}
                      className="p-2 text-muted-foreground hover:text-destructive rounded"
                      title="Delete context"
                      aria-label="Delete context"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={showDeleteConfirm !== null}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        title="Delete context?"
        description={
          <>
            <strong>
              {contexts.find((c) => c.id === showDeleteConfirm)?.name}
            </strong>{' '}
            will be removed from this browser. This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          showDeleteConfirm && handleConfirmDelete(showDeleteConfirm)
        }
      />

      {editingId && !showForm && (
        <ContextForm editingId={editingId} onClose={handleFormClose} />
      )}
    </div>
  );
}
