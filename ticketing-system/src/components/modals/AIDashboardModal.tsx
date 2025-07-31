import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';

interface AIDashboardModalProps {
  open: boolean;
  onClose: () => void;
  summary: string;
}

export default function AIDashboardModal({ open, onClose, summary }: AIDashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl dark:bg-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" /> AI Summary
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 whitespace-pre-wrap leading-relaxed">
          {summary || 'AI is generating summary...'}
        </div>
      </DialogContent>
    </Dialog>
  );
}
