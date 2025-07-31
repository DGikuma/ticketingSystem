import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";

interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
}

const dummyNotifications: Notification[] = [
  {
    id: 1,
    message: "🧠 AI analysis ready for ticket #302",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    message: "🎫 New ticket assigned to you: #289",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    message: "✅ Ticket #251 marked as resolved",
    read: true,
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 4,
    message: "📌 Reminder: SLA breach on ticket #277",
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");

  useEffect(() => {
    // Simulate API call with dummy data
    const timeout = setTimeout(() => {
      setNotifications(dummyNotifications);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const renderCard = (n: Notification) => (
    <motion.div
      key={n.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative overflow-hidden border-l-4 ${
          n.read ? "border-green-500" : "border-blue-500"
        } hover:shadow-xl transition-all duration-300`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/10 to-transparent dark:via-blue-400/5 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {n.read ? (
              <CheckCircle2 className="text-green-500 w-5 h-5" />
            ) : (
              <BellRing className="text-blue-500 w-5 h-5 animate-pulse" />
            )}
            <CardTitle className="text-base font-semibold">{n.message}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground pl-8">
          {new Date(n.created_at).toLocaleString()}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-lg">
          <TabsTrigger
            value="unread"
            className={activeTab === "unread" ? "bg-blue-600 text-white" : ""}
          >
            Unread <Badge className="ml-2">{unread.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="read"
            className={activeTab === "read" ? "bg-green-600 text-white" : ""}
          >
            Read <Badge className="ml-2">{read.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unread">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          ) : unread.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>
                    <Info className="inline-block w-5 h-5 mr-2 text-blue-500" />
                    No Unread Notifications
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-4 mt-4">{unread.map(renderCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="read">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          ) : read.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>
                    <Info className="inline-block w-5 h-5 mr-2 text-green-500" />
                    No Read Notifications
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-4 mt-4">{read.map(renderCard)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
