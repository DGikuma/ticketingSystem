import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { X, UserCheck2, Loader2 } from 'lucide-react';

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

// ✅ Small helper to always attach JWT
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  console.log(`📡 Fetching: ${url}`, { options, token });
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false); // 🔥 NEW
  const ticketsPerPage = 10;

  // ✅ Debounce search input (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // ✅ Fetch tickets from backend (with pagination + filters + search)
  const fetchTickets = async (page = 1, status = statusFilter, searchQuery = debouncedSearch) => {
    try {
      setLoading(true); // 🔥 show spinner
      console.log('📡 Fetching tickets from backend...');

      const query = new URLSearchParams({
        page: String(page),
        limit: String(ticketsPerPage),
      });
      if (status !== 'All') query.append('status', status.toLowerCase());
      if (searchQuery.trim()) query.append('search', searchQuery.trim());

      const res = await authFetch(`/api/ticket?${query.toString()}`);
      console.log('📥 Tickets response status:', res.status);

      if (res.status === 401) {
        toast.error('Unauthorized - please log in again');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch tickets');

      const data = await res.json();
      console.log('✅ Raw tickets data:', data);

      const ticketsArray = Array.isArray(data.data) ? data.data : [];
      const normalizedTickets = ticketsArray.map((ticket: any) => ({
        ...ticket,
        status:
          ticket.status === 'open'
            ? 'Open'
            : ticket.status === 'in_progress'
            ? 'Pending'
            : ticket.status === 'closed'
            ? 'Closed'
            : ticket.status,
        assigned_to_name: ticket.assigned_to_name || ticket.agent_name || null,
      }));

      console.log('🔧 Normalized tickets:', normalizedTickets);

      setTickets(normalizedTickets);
      setTotalTickets(data.meta?.total ?? normalizedTickets.length);
    } catch (err) {
      console.error('❌ Error fetching tickets:', err);
      toast.error('Error fetching tickets');
    } finally {
      setLoading(false); // 🔥 hide spinner
    }
  };

  // ✅ Load tickets when page, filter, or search changes
  useEffect(() => {
    fetchTickets(currentPage, statusFilter, debouncedSearch);
  }, [currentPage, statusFilter, debouncedSearch]);

  // ✅ Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await authFetch('/api/agents');
        console.log('📥 Agents response:', res.status);
        if (res.status === 401) {
          toast.error('Unauthorized - please log in again');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch agents');
        const data = await res.json();
        console.log('✅ Agents fetched:', data);
        setAgents(data);
      } catch (err) {
        console.error('❌ Error fetching agents:', err);
        toast.error('Error fetching agents');
      }
    };
    fetchAgents();
  }, []);

  // ✅ Assign agent → refetch current page
  const handleAssignAgent = async (agentId: string) => {
    if (!selectedTicket) return;
    console.log(`✍️ Assigning agent ${agentId} → ticket ${selectedTicket.id}`);

    try {
      const res = await authFetch(`/api/tickets/${selectedTicket.id}/assignTicket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      console.log("📥 Assign response status:", res.status);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to assign ticket → ${res.status} ${errText}`);
      }

      const updated = await res.json();
      console.log("✅ Ticket updated:", updated);

      toast.success(`Assigned to ${updated.assigned_to_name}`);
      setSelectedTicket(null);

      // 🔄 Refetch tickets with current filters
      fetchTickets(currentPage, statusFilter, debouncedSearch);
    } catch (err) {
      console.error("❌ Error assigning agent:", err);
      toast.error("Error assigning agent");
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-tr from-slate-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">🎫 All Tickets</h2>
        <div className="flex gap-3 items-center">
          <Input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64"
          />
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg">
              <SelectItem value="All" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                All
              </SelectItem>
              <SelectItem value="Open" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                Open
              </SelectItem>
              <SelectItem value="Pending" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                Pending
              </SelectItem>
              <SelectItem value="Closed" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                Closed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🔥 Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Tickets Table */}
      {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-10 text-gray-500">
            <span className="text-lg font-medium">No results found</span>
            <span className="text-sm">Try adjusting your filters or search query.</span>
          </div>
        ) : (
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
              {tickets.map((ticket) => (
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
        )}

      {/* Pagination */}
      {!loading && (
        <div className="flex justify-between items-center text-sm mt-4 text-gray-700 dark:text-gray-300">
          <span>
            Page <strong>{currentPage}</strong> of {Math.ceil(totalTickets / ticketsPerPage)}
          </span>
          <div className="space-x-2">
            {Array.from({ length: Math.ceil(totalTickets / ticketsPerPage) }, (_, i) => (
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
      )}

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
                  <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg">
                    {agents.map((agent) => (
                      <SelectItem
                        key={agent.id}
                        value={agent.id.toString()}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
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
