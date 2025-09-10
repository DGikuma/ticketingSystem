import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TicketIcon, EyeIcon, PencilIcon } from 'lucide-react';
import ViewTicketModal from '@/components/modals/TicketModal';
import EditTicketModal from '@/components/modals/EditTicketModal';
import { toast } from 'react-toastify';

type Ticket = {
  id: string;
  subject: string;      // ✅ matches backend
  status: string;
  createdAt: string;
  description: string;
  priority: string;
  assignedTo: string;
  attachments: any[];
  comments: any[];
};

const statusColors: Record<string, string> = {
  Open: 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-white',
  'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-white',
};

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Fetch assigned tickets from API
  const fetchTickets = async () => {
    try {
      const apiUrl = '/api/assigned'; 
      console.log("⏩ Fetching tickets from backend...", apiUrl);

      const token = localStorage.getItem('token');
      console.log("🔑 Token from localStorage:", token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("📡 Fetch response status:", res.status);

      const data = await res.json();
      console.log("📥 Backend returned:", data);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch tickets');
      }

      setTickets(data.tickets || []);
      console.log("✅ Tickets state updated, count:", data.tickets?.length || 0);

    } catch (err: any) {
      console.error("❌ Error in fetchTickets:", err);
      setError(err.message || 'Unable to load tickets');
      toast.error(`Failed to load tickets: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket =>
      ticket.subject.toLowerCase().includes(search.toLowerCase())
    );
  }, [tickets, search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <TicketIcon className="w-6 h-6 text-blue-500" />
          My Assigned Tickets
        </h2>
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm dark:bg-zinc-800"
        />
      </div>

      {loading && <p className="text-gray-500">Loading tickets...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ Graceful fallback */}
      {!loading && !error && filteredTickets.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 italic text-center py-10">
          No tickets assigned.
        </p>
      )}

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
                {ticket.subject}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
              <Badge className={`mt-2 ${statusColors[ticket.status] || ''}`}>
                {ticket.status}
              </Badge>
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
          <ViewTicketModal
            open={true}
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
        {selectedTicket && editMode && (
          <EditTicketModal
            ticket={selectedTicket}
            onClose={() => {
              setSelectedTicket(null);
              fetchTickets(); // 🔄 refresh list after editing
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;
