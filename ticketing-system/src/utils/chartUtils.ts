export function generateStatusCounts(tickets: any[]) {
  const statusCounts = {
    Open: 0,
    InProgress: 0,
    Resolved: 0,
    Closed: 0,
  };

  for (const ticket of tickets) {
    const status = ticket.status;
    if (status && statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  }

  // ✅ Return array for charts
  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));
}

export function generateAgentLoad(tickets: any[]) {
  const agentLoad: Record<string, number> = {};

  for (const ticket of tickets) {
    const agent = ticket.assignedTo || "Unassigned";
    agentLoad[agent] = (agentLoad[agent] || 0) + 1;
  }

  // ✅ Return array for charts
  return Object.entries(agentLoad).map(([agent, count]) => ({
    name: agent,
    value: count,
  }));
}
