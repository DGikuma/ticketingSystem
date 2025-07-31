import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

export default function StatusChart({ data }: { data: Record<string, number> }) {
  const formatted = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Tickets by Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={formatted} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
            {formatted.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}