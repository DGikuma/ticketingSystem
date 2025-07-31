import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { generateAgentLoad, generateStatusCounts } from '@/utils/chartUtils';
import AgentLoadChart from '@/components/charts/AgentLoadChart';
import StatusChart from '@/components/charts/StatusChart';

const mockTickets: Ticket[] = [
  {
    id: 1,
    subject: 'Refund Request',
    status: 'open',
    priority: 'high',
    department: 'Finance',
    created_at: '2025-07-20',
    assigned_to: 'Agent A',
  },
  {
    id: 2,
    subject: 'Login Issue',
    status: 'in-progress',
    priority: 'medium',
    department: 'IT',
    created_at: '2025-07-21',
    assigned_to: 'Agent B',
  },
  {
    id: 3,
    subject: 'Feature Request',
    status: 'closed',
    priority: 'low',
    department: 'Dev',
    created_at: '2025-07-15',
    assigned_to: 'Agent C',
  },
];

const PAGE_SIZE = 4;

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('open');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const filtered = mockTickets.filter(
    (t) =>
      (activeTab === 'all' || t.status === activeTab) &&
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Simulate API
        const paginated = filtered.slice(
          (page - 1) * PAGE_SIZE,
          page * PAGE_SIZE
        );
        setTickets(paginated);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [activeTab, search, page]);

  const statusCounts = generateStatusCounts(filtered);
  const agentLoad = generateAgentLoad(filtered);

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'in-progress':
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    closed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="min-h-screen p-4 space-y-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusChart data={statusCounts} />
        <AgentLoadChart data={agentLoad} />
      </div>

      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        setPage(1);
      }}>
        <TabsList className="flex gap-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-inner mt-6">
          {['all', 'open', 'in-progress', 'closed'].map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === status
                  ? 'bg-white dark:bg-gray-900 shadow text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tickets found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority:</span>
                        <Badge variant="outline">{ticket.priority}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned:</span>
                        <span>{ticket.assigned_to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{ticket.created_at}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
