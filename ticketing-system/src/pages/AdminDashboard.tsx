import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TicketIcon,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";
import { Ticket } from "@/types/tickets";
import { generateAgentLoad, generateStatusCounts } from "@/utils/chartUtils";
import AgentLoadChart from "@/components/charts/AgentLoadChart";
import StatusChart from "@/components/charts/StatusChart";

const PAGE_SIZE = 6;

type KPIs = {
  totalTickets: number;
  activeTickets: number;
  closedTickets: number;
  avgResolutionTime: string;
};

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<KPIs>({
    totalTickets: 0,
    activeTickets: 0,
    closedTickets: 0,
    avgResolutionTime: "0h",
  });

  // 🔹 Shared heartbeat animation
  const heartbeatAnimation = {
    animate: {
      boxShadow: [
        "0 0 0px rgba(0,0,0,0.2)",
        "0 0 20px rgba(139,92,246,0.35)",
        "0 0 0px rgba(0,0,0,0.2)",
      ],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
  };

  // 🔹 Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/tickets?page=${page}&limit=${PAGE_SIZE}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch tickets");
        const data = await res.json();

        setTickets(data.tickets || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        toast.error("Unable to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [page]);

  // 🔹 Fetch KPIs
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch KPIs");
        const data = await res.json();
        setKpis(data);
      } catch (err) {
        console.error("Error fetching KPIs", err);
      }
    };
    fetchKpis();
  }, []);

  const filtered = tickets.filter(
    (t) =>
      (activeTab === "all" || t.status === activeTab) &&
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = generateStatusCounts(tickets);
  const agentLoad = generateAgentLoad(tickets);

  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-700 border border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-600",
    "in-progress":
      "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-600",
    closed:
      "bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-600",
  };

  const kpiCards = [
    {
      label: "Total Tickets",
      value: kpis.totalTickets,
      icon: <TicketIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      color: "from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-700/20",
    },
    {
      label: "Active Tickets",
      value: kpis.activeTickets,
      icon: <Activity className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      color:
        "from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-700/20",
    },
    {
      label: "Closed Tickets",
      value: kpis.closedTickets,
      icon: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
      color:
        "from-green-100 to-green-200 dark:from-green-500/20 dark:to-green-700/20",
    },
    {
      label: "Avg Resolution Time",
      value: kpis.avgResolutionTime,
      icon: <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      color:
        "from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-700/20",
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-500 ease-in-out">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <motion.h2
          className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 drop-shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Dashboard
        </motion.h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiCards.map((kpi, idx) => {
          // Choose gradient & colors based on index
          const borderGradients = [
            "from-emerald-400 via-green-500 to-emerald-600", // Corporate Green
            "from-blue-400 via-indigo-500 to-blue-600",     // Corporate Blue
            "from-amber-400 via-orange-500 to-amber-600",   // Corporate Amber
            "from-rose-400 via-red-500 to-rose-600",        // Corporate Red
          ];

          const iconBg = [
            "bg-gradient-to-br from-emerald-400/30 to-green-600/30 text-emerald-500",
            "bg-gradient-to-br from-blue-400/30 to-indigo-600/30 text-blue-500",
            "bg-gradient-to-br from-amber-400/30 to-orange-600/30 text-amber-500",
            "bg-gradient-to-br from-rose-400/30 to-red-600/30 text-rose-500",
          ];

          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              animate={heartbeatAnimation}
              className={`relative rounded-3xl p-[2px] bg-gradient-to-r ${borderGradients[idx]} animate-gradient-x shadow-xl`}
            >
              {/* Inner Glassy Card */}
              <div
                className="relative overflow-hidden rounded-3xl
                          bg-gradient-to-br from-white/70 to-gray-100/60
                          dark:from-gray-900/60 dark:to-gray-800/40
                          backdrop-blur-xl shadow-2xl ring-1 ring-inset ring-black/10 dark:ring-white/5
                          p-6 transition-all duration-500 ease-out"
              >
                <div className="flex items-center justify-between">
                  {/* Icon Circle */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-inner ${iconBg[idx]}`}>
                    {kpi.icon}
                  </div>

                  {/* KPI Value */}
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">
                    {kpi.value}
                  </h2>
                </div>

                {/* KPI Label */}
                <p className="mt-4 text-sm uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  {kpi.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          {...heartbeatAnimation}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-2xl p-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out"
        >
          <StatusChart data={statusCounts} />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          {...heartbeatAnimation}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-2xl p-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out"
        >
          <AgentLoadChart data={agentLoad} />
        </motion.div>
      </div>

      {/* Ticket Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setPage(1);
        }}
      >
      <TabsList className="flex gap-2 p-2 rounded-xl bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-md shadow-inner mt-6">
        {["all", "open", "in-progress", "closed"].map((status) => {
          // Map colors for active tab
          const activeColors: Record<string, string> = {
            all: "from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400",
            open: "from-green-500 to-green-600 dark:from-green-400 dark:to-green-500",
            "in-progress":
              "from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500",
            closed: "from-red-500 to-red-600 dark:from-red-400 dark:to-red-500",
          };

          return (
            <motion.div key={status} {...(activeTab === status ? heartbeatAnimation : {})}>
              <TabsTrigger
                value={status}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out ${
                  activeTab === status
                    ? `bg-gradient-to-r ${activeColors[status]} text-white shadow-lg hover:shadow-xl`
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:scale-105"
                }`}
              >
                {status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </TabsTrigger>
            </motion.div>
          );
        })}
      </TabsList>
        <TabsContent value={activeTab}>
          <div className="space-y-4 mt-6">
            {/* Search */}
            <Input
              placeholder="🔍 Search tickets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm bg-gray-100/80 border-gray-300/50 text-gray-900
               placeholder:text-gray-500 dark:bg-gray-800/70 dark:border-gray-700/50
                dark:text-white dark:placeholder:text-gray-400 rounded-xl hover:shadow-md transition-all duration-300 ease-in-out"
            />

            {/* Tickets */}
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No tickets found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((ticket) => (
                  <motion.div key={ticket.id} whileHover={{ scale: 1.05, y: -4 }}>
                    <Card className="bg-white/70 dark:bg-gray-900/70 border
                   border-gray-200/50 dark:border-gray-700/50 backdrop-blur-2xl shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          {ticket.subject}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
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
                          <span>{ticket.assigned_to || "Unassigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <motion.div {...heartbeatAnimation}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="bg-gray-100/80 border-gray-300/50 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white dark:bg-gray-800/70 dark:border-gray-700/50 dark:text-gray-300 dark:hover:from-purple-400 dark:hover:to-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
                  >
                    Previous
                  </Button>
                </motion.div>
                <motion.div {...heartbeatAnimation}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="bg-gray-100/80 border-gray-300/50 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white dark:bg-gray-800/70 dark:border-gray-700/50 dark:text-gray-300 dark:hover:from-purple-400 dark:hover:to-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
                  >
                    Next
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
