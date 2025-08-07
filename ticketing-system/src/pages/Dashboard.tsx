import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

import { Ticket } from "../types/tickets";

import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { jwtDecode } from "jwt-decode";

const PAGE_SIZE = 5;

const UserDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("open");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<any>(null);

  const [ticketsByStatus, setTicketsByStatus] = useState<Record<string, Ticket[]>>({
    open: [],
    "in_progress": [],
    closed: [],
  });

  const [totalPagesByStatus, setTotalPagesByStatus] = useState<Record<string, number>>({
    open: 1,
    "in_progress": 1,
    closed: 1,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("[UserDashboard] Token from localStorage:", token);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("[UserDashboard] Decoded token payload:", decoded);
        setUser(decoded);
      } catch (decodeError) {
        console.error("[UserDashboard] Token decoding failed:", decodeError);
      }
    } else {
      console.warn("[UserDashboard] No token found in localStorage.");
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");
    console.log("[fetchTickets] Attempting fetch with token:", token);

    if (!token) {
      console.warn("[fetchTickets] No token found, skipping fetch.");
      return;
    }

    const url = `http://localhost:4000/api/tickets?status=${activeTab}&search=${search}&page=${page}&limit=${PAGE_SIZE}`;
    console.log(`[fetchTickets] Fetching: ${url}`);

    try {
      setLoading(true);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[fetchTickets] Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[fetchTickets] Fetch error response:", errorData);
        throw new Error(errorData.error || "Failed to fetch tickets");
      }

      const data = await res.json();
      console.log("[fetchTickets] Tickets data received:", data);
      console.log("[fetchTickets] Ticket statuses:", data.tickets?.map((t: any) => t.status));

      setTicketsByStatus((prev) => ({
        ...prev,
        [activeTab]: data.tickets || [],
      }));

      setTotalPagesByStatus((prev) => ({
        ...prev,
        [activeTab]: data.totalPages || 1,
      }));
    } catch (error: any) {
      console.error("[fetchTickets] Exception during fetch:", error);
      toast.error(error.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab, search, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "in_progress": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    closed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  console.log("Tickets by status:", ticketsByStatus);
  console.log("Open Tickets:", ticketsByStatus["open"]);

  return (
    <div className="flex min-h-screen bg-muted text-foreground">
      <div className="flex-1 p-4 md:p-6 space-y-4">
        <h1 className="text-2xl font-bold">My Tickets</h1>

        {user?.email && (
          <p className="text-muted-foreground text-sm">
            Logged in as: <strong>{user.email}</strong>
          </p>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }}
        >
          <TabsList className="flex gap-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-inner">
            {["open", "in_progress", "closed"].map((status) => (
              <TabsTrigger
                key={status}
                value={status}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === status
                    ? "bg-white dark:bg-gray-900 shadow text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          {["open", "in_progress", "closed"].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Search tickets..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />

                {loading && activeTab === status ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-48 overflow-auto">
                      {JSON.stringify(ticketsByStatus[status], null, 2)}
                    </pre>

                  {ticketsByStatus[status]?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No tickets found.</p>
                  ) : (
                    <>
                      {console.log(`[Render] Tickets for ${status}:`, ticketsByStatus[status])}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ticketsByStatus[status].map((ticket) => (
                          <Card key={ticket.id}>
                            <CardHeader>
                              <CardTitle className="text-base">{ticket.subject}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <Badge className={statusColors[ticket.status] || ""}>
                                  {ticket.status || "N/A"}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Priority:</span>
                                <Badge variant="outline">{ticket.priority || "N/A"}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Assigned:</span>
                                <span>{ticket.assigned_to || "Unassigned"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{new Date(ticket.created_at).toLocaleDateString() || "N/A"}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                  </>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
