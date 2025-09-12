import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Ticket } from "@/types/tickets";


const mockTickets: Ticket[] = [
  {
    id: 1,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 2,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 3,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 4,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 5,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 6,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 7,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 8,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 9,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 10,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 11,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 12,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 13,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 14,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 15,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 16,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 17,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 18,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 19,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 20,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 21,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 22,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 23,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 24,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 25,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 26,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 27,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
    {
    id: 28,
    subject: "Cannot log in",
    status: "open",
    department: "Support",
    created_at: "2025-07-15",
    priority: "high",
    assigned_to: "Agent A",
  },
  {
    id: 29,
    subject: "Payment delay",
    status: "in-progress",
    department: "Finance",
    created_at: "2025-07-14",
    priority: "medium",
    assigned_to: "Agent B",
  },
  {
    id: 30,
    subject: "Resolved refund issue",
    status: "closed",
    department: "Billing",
    created_at: "2025-07-10",
    priority: "low",
    assigned_to: "Agent C",
  },
];

const PAGE_SIZE = 5;

const SupportDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState("open");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

const fetchTickets = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `http://localhost:4000/api/tickets?status=${activeTab}&search=${search}&page=${page}&limit=${PAGE_SIZE}`,
      {
        credentials: "include",
      }
    );
    const data = await res.json();

    // ✅ Defensive checks
    if (Array.isArray(data.tickets)) {
      setTickets(data.tickets);
      setTotalPages(data.totalPages ?? 1);
    } else {
      throw new Error("Invalid data shape from API");
    }
  } catch (error) {
    console.error("API fetch failed. Falling back to mock data.", error);

    // ✅ Also check mock data exists
    const filtered = mockTickets.filter(
      (t) =>
        t.status === activeTab &&
        t.subject.toLowerCase().includes(search.toLowerCase())
    );

    setTickets(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTickets();
  }, [activeTab, search, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page on search
  };

  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "in-progress":
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    closed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="flex min-h-screen bg-muted text-foreground">
      <div className="flex-1 p-4 md:p-6 space-y-4">
        <h1 className="text-2xl font-bold">Support Dashboard</h1>

        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          setPage(1);
        }}>
          <TabsList className="flex gap-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-inner">
            {["open", "in-progress", "closed"].map((status) => (
              <TabsTrigger
                key={status}
                value={status}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === status
                    ? "bg-white dark:bg-gray-900 shadow text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {status
                  .replace("-", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          {["open", "in-progress", "closed"].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />

                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                  </div>
                ) : tickets.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No tickets found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(tickets) &&
                      tickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {ticket.subject}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge
                              className={statusColors[ticket.status] || ""}
                            >
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
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default SupportDashboard;
