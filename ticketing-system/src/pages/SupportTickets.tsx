import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TicketIcon, EyeIcon, PencilIcon } from 'lucide-react';
import TicketModal from '@/components/modals/TicketModal';
import EditTicketModal from '@/components/modals/EditTicketModal';

const dummyTickets = [
  {
    id: 'TK-001',
    title: 'Login issue on dashboard',
    status: 'Open',
    createdAt: '2025-07-24',
    description: 'User unable to login with correct credentials.',
    priority: 'High',
    assignedTo: 'Jane Doe',
  },
  {
    id: 'TK-002',
    title: 'Payment not processing',
    status: 'In Progress',
    createdAt: '2025-07-23',
    description: 'Stripe payment stuck during checkout.',
    priority: 'Medium',
    assignedTo: 'John Smith',
  },
  {
    id: 'TK-003',
    title: 'App crash on iOS',
    status: 'Resolved',
    createdAt: '2025-07-21',
    description: 'App crashes immediately after launch.',
    priority: 'Low',
    assignedTo: 'Emily Stone',
  },
];

const statusColors = {
  Open: 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-white',
  'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-white',
};

const SupportTickets: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTickets = useMemo(() => {
    return dummyTickets.filter(ticket =>
      ticket.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <TicketIcon className="w-6 h-6 text-blue-500" />
          Support Tickets
        </h2>
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm dark:bg-zinc-800"
        />
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {ticket.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {ticket.createdAt}
              </p>
              <Badge className={`mt-2 ${statusColors[ticket.status]}`}>{ticket.status}</Badge>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setEditMode(false);
                }}
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                className="bg-violet-500 hover:bg-violet-600 text-white"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setEditMode(true);
                }}
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTicket && !editMode && (
          <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}
        {selectedTicket && editMode && (
          <EditTicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;
