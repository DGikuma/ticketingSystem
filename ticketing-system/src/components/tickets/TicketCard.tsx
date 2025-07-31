import React from 'react';
import { format } from 'date-fns';
import { BadgeCheck, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: {
    id: string;
    title: string;
    status: 'open' | 'pending' | 'resolved' | 'closed';
    createdAt: string;
    priority?: 'low' | 'medium' | 'high';
    user?: string;
  };
  onClick?: () => void;
}

const statusMap = {
  open: {
    label: 'Open',
    color: 'bg-green-100 text-green-700',
    icon: <BadgeCheck className="w-4 h-4" />,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="w-4 h-4" />,
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-blue-100 text-blue-700',
    icon: <BadgeCheck className="w-4 h-4" />,
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-200 text-gray-600',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const status = statusMap[ticket.status];

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold line-clamp-1">{ticket.title}</h3>
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
            status.color
          )}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Submitted on {format(new Date(ticket.createdAt), 'PPpp')}
      </div>

      {ticket.priority && (
        <div className="mt-1 text-xs font-medium text-right text-gray-500 capitalize">
          Priority: {ticket.priority}
        </div>
      )}
    </div>
  );
}
