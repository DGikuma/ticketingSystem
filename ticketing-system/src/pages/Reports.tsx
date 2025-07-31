import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Building2, PieChart as PieIcon, Users } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#facc15'];

const summaryData = [
  { name: 'Mon', tickets: 12 },
  { name: 'Tue', tickets: 18 },
  { name: 'Wed', tickets: 22 },
  { name: 'Thu', tickets: 17 },
  { name: 'Fri', tickets: 25 },
  { name: 'Sat', tickets: 9 },
  { name: 'Sun', tickets: 6 },
];

const deptData = [
  {
    department: 'IT',
    agents: [
      { name: 'Alice Tech', tickets: 18 },
      { name: 'Sam Code', tickets: 15 },
    ],
  },
  {
    department: 'HR',
    agents: [
      { name: 'Grace HR', tickets: 12 },
      { name: 'Kevin Recruit', tickets: 9 },
    ],
  },
  {
    department: 'Finance',
    agents: [
      { name: 'Maya Ledger', tickets: 14 },
      { name: 'Leo Budget', tickets: 11 },
    ],
  },
  {
    department: 'Legal',
    agents: [
      { name: 'Nina Law', tickets: 10 },
      { name: 'Ethan Rights', tickets: 8 },
    ],
  },
];

const prioritySummary = [
  { priority: 'High', count: 30 },
  { priority: 'Medium', count: 40 },
  { priority: 'Low', count: 26 },
];

const agentOverview = [
  { name: 'Alice Tech', tickets: 18 },
  { name: 'Sam Code', tickets: 15 },
  { name: 'Grace HR', tickets: 12 },
  { name: 'Kevin Recruit', tickets: 9 },
  { name: 'Maya Ledger', tickets: 14 },
  { name: 'Leo Budget', tickets: 11 },
  { name: 'Nina Law', tickets: 10 },
  { name: 'Ethan Rights', tickets: 8 },
];

const TABS = [
  { key: 'summary', label: 'Date Range', icon: CalendarDays, color: 'text-blue-500' },
  { key: 'dept', label: 'Departments', icon: Building2, color: 'text-emerald-500' },
  { key: 'priority', label: 'Priorities', icon: PieIcon, color: 'text-yellow-500' },
  { key: 'agents', label: 'Agents', icon: Users, color: 'text-purple-500' },
];

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // 📌 Persist active tab to localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('reports-active-tab');
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem('reports-active-tab', activeTab);
  }, [activeTab]);

  const handleDeptClick = (payload: any) => {
    if (!payload) return;
    alert(`Drilldown: Viewing agents in ${payload.department}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">📊 Reports Dashboard</h2>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">From:</span>
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            className="border px-2 py-1 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">To:</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date) => setEndDate(date)}
            className="border px-2 py-1 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative flex gap-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl shadow-inner mb-6">
          {TABS.map(({ key, label, icon: Icon, color }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`group relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-white dark:bg-neutral-900 shadow text-black dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? color : 'text-gray-400'
                  }`}
                />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="tabHighlight"
                    className="absolute inset-0 rounded-lg bg-white dark:bg-neutral-900 shadow-md z-[-1]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <TabsContent value="summary" asChild>
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader><CardTitle>📈 Tickets Over Time</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={summaryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                    <Insight text="Peak ticket volume observed on Friday with 25 tickets. Consider assigning more agents on Fridays." />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === 'dept' && (
            <TabsContent value="dept" asChild>
              <motion.div
                key="dept"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader><CardTitle>🏢 Tickets by Department</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={deptData.map(d => ({
                          department: d.department,
                          tickets: d.agents.reduce((sum, a) => sum + a.tickets, 0),
                        }))}
                        onClick={({ activePayload }) => handleDeptClick(activePayload?.[0]?.payload)}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="tickets" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                    <Insight text="IT department handles the most tickets. Consider redistributing workload for balance." />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === 'priority' && (
            <TabsContent value="priority" asChild>
              <motion.div
                key="priority"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader><CardTitle>🥧 Tickets by Priority</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          dataKey="count"
                          data={prioritySummary}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {prioritySummary.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                    <Insight text="Majority of tickets are of Medium priority. Monitor trends to catch urgent spikes." />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === 'agents' && (
            <TabsContent value="agents" asChild>
              <motion.div
                key="agents"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader><CardTitle>👥 Agent Ticket Volume</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={agentOverview}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="tickets" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                    <Insight text="Alice Tech leads in ticket handling. Recognize performance and ensure others are supported." />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

// 🧠 AI Insight Component
const Insight = ({ text }: { text: string }) => (
  <p className="mt-4 text-sm italic text-gray-600 dark:text-gray-400">💡 Insight: {text}</p>
);

// 💡 Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white dark:bg-neutral-800 p-3 rounded shadow text-sm border dark:border-neutral-700">
      <p className="font-semibold">{label}</p>
      <p>{`${item.name || item.dataKey}: ${item.value}`}</p>
    </div>
  );
};
