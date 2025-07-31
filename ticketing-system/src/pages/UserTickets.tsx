import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Ticket,
  Loader2,
  CircleDot,
  CheckCircle,
  Clock4,
  AlertTriangle,
  X,
  SendHorizontal,
  Loader,
  Pencil, 
  FileText
} from 'lucide-react';

interface TicketType {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  description?: string;
  priority?: string;
  assigned_to?: string;
}

interface CommentType {
  id: number;
  content: string;
  created_at: string;
  author: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/tickets/user', {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch tickets');

      setTickets(data);
      setFilteredTickets(data);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');

      const mock = [
        {
          id: 1,
          subject: 'Unable to log in',
          status: 'open',
          created_at: '2025-07-15',
          description: 'I tried logging in but got a 500 error.',
          priority: 'High',
          assigned_to: 'Agent Jane',
        },
        {
          id: 2,
          subject: 'Payment not processed',
          status: 'pending',
          created_at: '2025-07-14',
          description: 'I paid but the system didn’t update.',
          priority: 'Medium',
          assigned_to: 'Agent John',
        },
        {
          id: 3,
          subject: 'Bug in mobile app',
          status: 'closed',
          created_at: '2025-07-13',
          description: 'The submit button crashes the app.',
          priority: 'Low',
          assigned_to: 'Agent Mercy',
        },
      ];
      setTickets(mock);
      setFilteredTickets(mock);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = tickets.filter(ticket =>
      ticket.subject.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTickets(filtered);
  };

  const getStatusIcon = (status: string) => {
    const base = 'w-4 h-4';
    switch (status.toLowerCase()) {
      case 'open':
        return <CircleDot className={`${base} text-blue-500`} title="Open" />;
      case 'pending':
        return <Clock4 className={`${base} text-yellow-500`} title="Pending" />;
      case 'closed':
        return <CheckCircle className={`${base} text-green-500`} title="Closed" />;
      default:
        return <AlertTriangle className={`${base} text-gray-400`} title="Unknown" />;
    }
  };

  const handleSave = async () => {
    setEditLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      toast.success('Ticket updated');
      setSelectedTicket((prev) =>
        prev ? { ...prev, subject: editSubject, description: editDescription } : null
      );
      setIsEditing(false);
    } catch {
      toast.error('Failed to update');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentInput.trim()) return;
    setCommentLoading(true);
    const newComment: CommentType = {
      id: Date.now(),
      content: commentInput,
      created_at: new Date().toISOString(),
      author: 'You'
    };
    setComments(prev => [...prev, newComment]);
    setCommentInput('');
    try {
      await new Promise((res) => setTimeout(res, 1000));
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post');
    } finally {
      setCommentLoading(false);
    }
  };

  const openModal = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setEditSubject(ticket.subject);
    setEditDescription(ticket.description || '');
    setComments([]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
        <Ticket className="w-6 h-6" /> My Tickets
      </h2>

      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search tickets..."
        className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring focus:ring-blue-400"
      />

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin w-5 h-5" /> Loading tickets...
        </div>
      ) : (
        <div className="overflow-x-auto shadow ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Subject</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-100">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => openModal(ticket)}
                    className="hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-6 py-4">{ticket.subject}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="capitalize">{ticket.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Transition appear show={!!selectedTicket} as={Fragment}>

    <Dialog as="div" className="relative z-50" onClose={() => setSelectedTicket(null)}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300 transform"
          enterFrom="opacity-0 scale-90"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-90"
        >
          <Dialog.Panel
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto transform rounded-2xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 shadow-2xl transition-all"
          >
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-zinc-700 pb-4 mb-4">
              <Dialog.Title className="text-lg sm:text-xl font-semibold">
                {isEditing ? (
                  <input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-300 dark:border-zinc-600 focus:outline-none text-lg dark:bg-transparent"
                  />
                ) : (
                  selectedTicket?.subject
                )}
              </Dialog.Title>
              <div className="flex gap-2 items-center">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition">
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => setSelectedTicket(null)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <strong>Status:</strong>{' '}
                  <span className="capitalize inline-block px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800/40 text-blue-800 dark:text-blue-200">
                    {selectedTicket?.status}
                  </span>
                </p>
                <p>
                  <strong>Created:</strong> {new Date(selectedTicket?.created_at || '').toLocaleString()}
                </p>
                <p>
                  <strong>Priority:</strong> {selectedTicket?.priority}
                </p>
                <p>
                  <strong>Assigned To:</strong> {selectedTicket?.assigned_to || 'Unassigned'}
                </p>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500 text-sm">
                <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">🤖 AI Summary</h4>
                <p>
                  This ticket seems related to a recent issue affecting multiple users. Suggested actions: confirm priority,
                  tag relevant team, and verify impact. Please ensure SLA alignment.
                </p>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">🖼️ Attachments</h4>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-40">
                  <div className="relative group rounded-lg overflow-hidden shadow border dark:border-zinc-700">
                    <img
                      src="/mock/image-preview.jpg"
                      alt="attachment"
                      className="object-cover w-full h-32"
                    />
                    <a
                      href="/mock/image-preview.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition"
                    >
                      View
                    </a>
                  </div>
                  <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center gap-3">
                    <FileText className="text-gray-500 dark:text-gray-300 w-5 h-5" />
                    <span className="truncate text-sm">report-summary.pdf</span>
                  </div>
                </div>
              </div>
                        {isEditing && (
                            <div>
                            <button
                                onClick={handleSave}
                                disabled={editLoading}
                                className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm shadow-lg transition"
                            >
                                {editLoading ? <Loader className="animate-spin w-4 h-4" /> : '💾 Save Changes'}
                            </button>
                            </div>
                        )}
                        </div>

                        {/* Comments */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold mb-2">💬 Comments</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {comments.length === 0 && <p className="text-gray-400">No comments yet.</p>}
                            {comments.map((c) => (
                            <div key={c.id} className="text-sm p-3 bg-gray-100 rounded-lg shadow">
                                <p className="text-xs text-gray-500 mb-1">{c.author} — {new Date(c.created_at).toLocaleString()}</p>
                                <p>{c.content}</p>
                            </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <input
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-400 shadow-inner"
                            />
                            <button
                            onClick={handlePostComment}
                            disabled={commentLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow transition"
                            >
                            {commentLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <SendHorizontal className="w-4 h-4" />
                            )}
                            </button>
                        </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
      </Transition>
    </div>
  );
}
