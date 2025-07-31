// src/pages/AdminTickets.tsx
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { X, UserCheck2, Save } from 'lucide-react';

interface Ticket {
  id: number;
  subject: string;
  status: 'Open' | 'Pending' | 'Closed';
  assigned_to_name: string | null;
  created_at: string;
}

interface Agent {
  id: number;
  name: string;
}

const statusColors: Record<string, string> = {
  Open: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-800',
  Closed: 'bg-red-100 text-red-700',
};

const dummyTickets: Ticket[] = Array.from({ length: 33 }, (_, i) => ({
  id: i + 1,
  subject: `Ticket Subject ${i + 1}`,
  status: ['Open', 'Pending', 'Closed'][i % 3] as Ticket['status'],
  assigned_to_name: i % 2 === 0 ? `Agent ${i % 5 + 1}` : null,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

const dummyAgents: Agent[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Agent ${i + 1}`,
}));

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtered, setFiltered] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    setTickets(dummyTickets);
  }, []);

  useEffect(() => {
    const filter = statusFilter === 'All'
      ? tickets
      : tickets.filter(ticket => ticket.status === statusFilter);
    setFiltered(filter);
    setCurrentPage(1);
  }, [statusFilter, tickets]);

  const handleAssignAgent = (agentId: string) => {
    const agent = dummyAgents.find(a => a.id === parseInt(agentId));
    if (agent && selectedTicket) {
      const updated = tickets.map(t =>
        t.id === selectedTicket.id ? { ...t, assigned_to_name: agent.name } : t
      );
      setTickets(updated);
      toast.success(`Assigned to ${agent.name}`);
      setSelectedTicket(null);
    }
  };

  const paginated = filtered.slice(
    (currentPage - 1) * ticketsPerPage,
    currentPage * ticketsPerPage
  );

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-tr from-slate-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">🎫 All Tickets</h2>
        <div className="flex items-center gap-3">
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
        <table className="w-full table-auto text-sm bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-gray-700 to-gray-900 text-white text-left text-sm uppercase">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(ticket => (
              <motion.tr
                key={ticket.id}
                className="border-b even:bg-gray-50 dark:even:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <td className="p-3 font-semibold">{ticket.id}</td>
                <td className="p-3">{ticket.subject}</td>
                <td className="p-3">
                  <Badge className={cn('px-2 py-1 text-xs rounded-full', statusColors[ticket.status])}>
                    {ticket.status}
                  </Badge>
                </td>
                <td className="p-3">{ticket.assigned_to_name || 'Unassigned'}</td>
                <td className="p-3">{format(new Date(ticket.created_at), 'PPpp')}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm mt-4 text-gray-700 dark:text-gray-300">
        <span>
          Page <strong>{currentPage}</strong> of {Math.ceil(filtered.length / ticketsPerPage)}
        </span>
        <div className="space-x-2">
          {Array.from({ length: Math.ceil(filtered.length / ticketsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={cn(
                'px-3 py-1 rounded-lg font-medium transition-all',
                currentPage === i + 1
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <Dialog open={true} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="rounded-2xl shadow-2xl border border-gray-300 bg-white dark:bg-gray-900 max-w-xl">
            <DialogHeader className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 rounded-t-2xl text-white">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <UserCheck2 /> Ticket #{selectedTicket.id}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4 text-sm">
              <p><strong>Subject:</strong> {selectedTicket.subject}</p>
              <p>
                <strong>Status:</strong>{' '}
                <Badge className={cn('text-xs px-2 py-1', statusColors[selectedTicket.status])}>
                  {selectedTicket.status}
                </Badge>
              </p>
              <p><strong>Assigned:</strong> {selectedTicket.assigned_to_name || 'Unassigned'}</p>
              <p><strong>Created At:</strong> {format(new Date(selectedTicket.created_at), 'PPpp')}</p>

              <div className="space-y-1">
                <label className="text-sm font-medium">Assign Agent</label>
                <Select onValueChange={handleAssignAgent}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  <X size={16} className="mr-1" /> Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
