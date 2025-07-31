import React from 'react';
import TicketCard from './TicketCard';

interface TicketListProps {
  tickets: any[];
  loading: boolean;
  onViewSummary: (ticket: any) => void;
}

export default function TicketList({ tickets, loading, onViewSummary }: TicketListProps) {
  if (loading) return <p className="text-center py-10 text-sm text-gray-500">Loading tickets...</p>;
  if (!tickets.length) return <p className="text-center py-10 text-sm text-gray-400">No tickets found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} onViewSummary={onViewSummary} />
      ))}
    </div>
  );
}
