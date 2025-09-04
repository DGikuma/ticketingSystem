import { useState } from "react";
import { Search, Pencil, Trash2, X, User, Save, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "react-toastify";
import useAgents from "@/hooks/useAgents"; // <-- the hook we created

interface Agent {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive"; // ✅ add this
  join_date: string;
  ticket_count?: number;
  performance?: { day: string; tickets: number }[];
}

export default function AdminAgents() {
  const {
    agents,
    allAgents,
    selectedAgent,
    setSelectedAgent,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    handleSaveEdit,
    handleDelete,
    handleToggleStatus,
  } = useAgents();

  const agentsPerPage = 10;
  const totalPages = Math.ceil(allAgents.length / agentsPerPage);

  const departmentColors: Record<string, string> = {
    IT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-white",
    HR: "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white",
    Finance: "bg-pink-100 text-pink-700 dark:bg-pink-700 dark:text-white",
    Legal: "bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-white",
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-tr from-neutral-100 via-white to-neutral-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen rounded-xl shadow-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Users className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
          Agent Management
        </h2>
        <div className="relative">
          <Search className="absolute top-2.5 left-3 text-gray-500" size={18} />
          <Input
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-inner focus:ring-2 ring-gray-500 focus:outline-none"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl shadow-2xl border border-neutral-200 dark:border-gray-700">
        <table className="w-full table-auto text-sm bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-neutral-600 to-gray-500 text-white text-left text-sm uppercase">
            <tr>
              <th className="p-3 text-center">Status</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3 text-center">Tickets</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className={cn(
                  "border-b even:bg-gray-50 dark:even:bg-gray-900/60 text-gray-700 dark:text-gray-200",
                  "transition duration-300 ease-in-out",
                  "hover:bg-neutral-200 dark:hover:bg-gray-700/80 hover:shadow-md hover:scale-[1.01]",
                  "cursor-pointer rounded-xl",
                  "hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 dark:hover:ring-gray-600"
                )}
              >
              <td className="p-3 text-center">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow",
                  agent.status === "active"
                    ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-white"
                    : "bg-red-200 text-red-800 dark:bg-red-700 dark:text-white"
                )}
              >
                <span className="mr-1 w-2 h-2 rounded-full bg-current animate-pulse"></span>
                {agent.status}
              </span>

              </td>
                <td className="p-3 font-semibold flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {agent.name}
                </td>
                <td className="p-3">{agent.email}</td>
                <td className="p-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      departmentColors[agent.department] ||
                        "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-white"
                    )}
                  >
                    {agent.department}
                  </Badge>
                </td>
                <td className="p-3 text-center">
                  <span className="bg-neutral-300 dark:bg-gray-600 text-neutral-800 dark:text-white px-2 py-1 rounded-full text-xs">
                    {agent.ticket_count}
                  </span>
                </td>
                <td className="p-3 text-center space-x-3">
                  <Button
                    onClick={() => setSelectedAgent({ ...agent })}
                    className="bg-neutral-700 hover:bg-neutral-800 text-white px-3 py-1 rounded-full shadow-md transition active:scale-95"
                    title="Edit Agent"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(agent)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full shadow-md transition active:scale-95"
                    title="Delete Agent"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-300">
        <span>
          Showing page <b>{currentPage}</b> of {totalPages}
        </span>
        <div className="space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={cn(
                "px-3 py-1 rounded-lg font-medium transition-all",
                currentPage === i + 1
                  ? "bg-neutral-700 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-neutral-200 dark:hover:bg-gray-800"
              )}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {selectedAgent && (
        <Dialog open={true} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="rounded-2xl shadow-2xl border border-neutral-300 bg-white dark:bg-gray-900">
            <DialogHeader className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 rounded-t-2xl text-white">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <User /> Edit Agent
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
                  selectedAgent.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                    : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                )}
              >
                <span className="mr-1 w-2 h-2 rounded-full bg-current animate-ping"></span>
                {selectedAgent.status}
              </span>
            </div>
              <Input
                value={selectedAgent.name}
                onChange={(e) =>
                  setSelectedAgent({ ...selectedAgent, name: e.target.value })
                }
                placeholder="Full Name"
              />
              <Input
                value={selectedAgent.email}
                onChange={(e) =>
                  setSelectedAgent({ ...selectedAgent, email: e.target.value })
                }
                placeholder="Email"
              />
              <Input
                value={selectedAgent.department}
                onChange={(e) =>
                  setSelectedAgent({ ...selectedAgent, department: e.target.value })
                }
                placeholder="Department"
              />

              <div className="mt-6">
                <h4 className="text-md font-semibold mb-2 text-gray-600">
                  📈 Performance (tickets this week)
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedAgent.performance || []}>
                    <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        color: "#fff",
                        borderRadius: 8,
                        border: "none",
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tickets"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 flex justify-between">
              <Button
                onClick={() => handleToggleStatus(selectedAgent)}
                className={`px-3 py-1 rounded font-medium ${
                  selectedAgent.status === "active"
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {selectedAgent.status === "active" ? "Deactivate" : "Activate"}
              </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedAgent(null)}>
                    <X size={16} /> Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    <Save size={16} /> Save
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
