import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgentLoadChart({ data }: { data: { agent: string; tickets: number }[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Agent Load</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="agent" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="tickets" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
