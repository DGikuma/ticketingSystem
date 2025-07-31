import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Mock data for daily tickets over the past week
const data = [
  { date: "Mon", tickets: 15 },
  { date: "Tue", tickets: 22 },
  { date: "Wed", tickets: 18 },
  { date: "Thu", tickets: 25 },
  { date: "Fri", tickets: 19 },
  { date: "Sat", tickets: 30 },
  { date: "Sun", tickets: 12 },
];

const DailyTicketChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl w-full h-80 transition-all duration-500">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Daily New Tickets
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyTicketChart;
