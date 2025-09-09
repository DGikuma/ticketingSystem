import { useEffect, useState, useCallback } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

export interface Agent {
  id: number;
  name: string;
  email: string;
  department: string;
  status: "active" | "inactive";
  join_date?: string;
  ticket_count: number; // ✅ always numeric now
  performance?: { day: string; tickets: number }[];
}

export default function useAgents(agentsPerPage = 10) {
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingAgentId, setTogglingAgentId] = useState<number | null>(null);

  const totalPages = Math.ceil(allAgents.length / agentsPerPage);

  /** ------------------ Backend URL ------------------ */
  const BASE_URL =
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_BACKEND_URL
      : "";

  /** ------------------ JWT Helpers ------------------ */
  const getToken = () => localStorage.getItem("token");

  const refreshToken = async (): Promise<string | null> => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        return res.data.token;
      }
      return null;
    } catch {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      return null;
    }
  };

  /** ------------------ Authenticated Axios ------------------ */
  const authRequest = async (config: AxiosRequestConfig) => {
    let token = getToken();
    if (!token) return Promise.reject({ message: "Not logged in" });

    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    if (!config.url?.startsWith("http")) {
      config.url = `${BASE_URL}${config.url}`;
    }

    try {
      return await axios(config);
    } catch (err: any) {
      if (err.response?.status === 401) {
        token = await refreshToken();
        if (!token) throw err;
        config.headers.Authorization = `Bearer ${token}`;
        return await axios(config);
      }
      throw err;
    }
  };

  /** ------------------ Fetch Agents ------------------ */
  const fetchAgents = useCallback(async () => {
    try {
      const res = await authRequest({ url: "/api/admin/agents", method: "GET" });

      let agents: Agent[] = [];

      if (Array.isArray(res.data)) {
        agents = res.data;
      } else if (res.data?.agents && Array.isArray(res.data.agents)) {
        agents = res.data.agents;
      } else {
        console.warn("⚠️ Unexpected response format:", res.data);
        agents = [];
      }

      console.log("📦 Raw agents from backend:", agents); // 👈 debug log

      // ✅ Ensure ticket_count is always a number
      agents = agents.map((a) => ({
        ...a,
        ticket_count: Number(a.ticket_count) || 0,
      }));

      console.log("✅ Normalized agents:", agents); // 👈 after normalization

      setAllAgents(agents);
    } catch (err: any) {
      console.error("❌ Error fetching agents:", err);
      toast.error(err.message || "Failed to fetch agents");
      setAllAgents([]);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  /** ------------------ Filter & Paginate ------------------ */
  const filterAndPaginate = useCallback(() => {
    const filtered = allAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.email.toLowerCase().includes(search.toLowerCase())
    );
    const paginated = filtered.slice(
      (currentPage - 1) * agentsPerPage,
      currentPage * agentsPerPage
    );
    setAgents(paginated);
  }, [allAgents, search, currentPage, agentsPerPage]);

  useEffect(() => {
    filterAndPaginate();
  }, [allAgents, currentPage, filterAndPaginate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /** ------------------ Save Edit ------------------ */
  const handleSaveEdit = async () => {
    if (!selectedAgent) return;
    try {
      const res = await authRequest({
        url: `/api/admin/agents/${selectedAgent.id}`,
        method: "PUT",
        data: {
          name: selectedAgent.name,
          email: selectedAgent.email,
          department: selectedAgent.department,
        },
      });

      const updated: Agent = {
        ...res.data,
        ticket_count: Number(res.data.ticket_count) || 0, // ✅ enforce numeric
      };

      setAllAgents((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setSelectedAgent(null);
      toast.success("Agent updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save agent");
    }
  };

  /** ------------------ Delete ------------------ */
  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Are you sure you want to delete ${agent.name}?`)) return;
    try {
      await authRequest({ url: `/api/admin/agents/${agent.id}`, method: "DELETE" });
      setAllAgents((prev) => prev.filter((a) => a.id !== agent.id));
      toast.success(`${agent.name} deleted successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  /** ------------------ Toggle Status ------------------ */
  const handleToggleStatus = async (agent: Agent) => {
    if (!agent) return;
    const previousStatus = agent.status;
    const newStatus = previousStatus === "active" ? "inactive" : "active";

    setTogglingAgentId(agent.id);

    // 🔹 Optimistic update
    setAllAgents((prev) =>
      prev.map((a) =>
        a.id === agent.id ? { ...a, status: newStatus } : a
      )
    );

    try {
      const res = await authRequest({
        url: `/api/admin/agents/toggle/${agent.id}`,
        method: "PUT",
      });

      const updated: Agent = {
        ...res.data,
        ticket_count: Number(res.data.ticket_count) || agent.ticket_count,
      };

      setAllAgents((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );

      toast.success(
        `Agent ${updated.status === "active" ? "reactivated ✅" : "deactivated 🚫"}`
      );
    } catch (err: any) {
      // 🔹 Rollback on error
      setAllAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, status: previousStatus } : a
        )
      );
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setTogglingAgentId(null);
    }
  };

  return {
    agents,
    allAgents,
    selectedAgent,
    setSelectedAgent,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    handleSaveEdit,
    handleDelete,
    handleToggleStatus,
    togglingAgentId,
  };
}
