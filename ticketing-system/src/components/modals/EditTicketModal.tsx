import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon, PaperclipIcon, CalendarIcon, MessageSquareIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import clsx from 'clsx';

interface FilePreview {
  name: string;
  type: string;
  url: string;
}

interface Props {
  ticket: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    description: string;
    priority?: 'Low' | 'Medium' | 'High';
    assignedTo?: string;
    dueDate?: string;
  };
  onClose: () => void;
}

const EditTicketModal: React.FC<Props> = ({ ticket, onClose }) => {
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority || 'Medium');
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [dueDate, setDueDate] = useState<Date | null>(ticket.dueDate ? new Date(ticket.dueDate) : null);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [openSection, setOpenSection] = useState<'attachments' | 'duedate' | 'comments' | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    const previews = Array.from(uploadedFiles).map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    setFiles(prev => [...prev, ...previews]);
    toast.success(`${uploadedFiles.length} file(s) attached`);
  };

  const handleRemoveFile = (name: string) => {
    setFiles(prev => prev.filter(file => file.name !== name));
    toast.info('File removed');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, newComment.trim()]);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleSubmit = () => {
    toast.success('Ticket updated successfully!');
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-gradient-to-br from-violet-50 to-white dark:from-zinc-800 dark:to-zinc-900 border border-violet-300 dark:border-zinc-700 rounded-2xl shadow-xl p-6 max-w-xl w-full overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Edit Ticket</h2>

        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ticket Title" />
          <textarea
            rows={4}
            className="w-full p-3 rounded-md border dark:bg-zinc-800 dark:text-white resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />

          <div className="flex gap-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 rounded-md border dark:bg-zinc-800 dark:text-white"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
              className="w-full p-2 rounded-md border dark:bg-zinc-800 dark:text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <Input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Assigned Agent (e.g., Jane Doe)"
          />

          {/* 📎 Attachments Section */}
          <div>
            <button
              className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
              onClick={() => setOpenSection(openSection === 'attachments' ? null : 'attachments')}
            >
              <PaperclipIcon className="w-4 h-4" />
              Attachments
            </button>
            {openSection === 'attachments' && (
              <div className="mt-2 space-y-2">
                <Input type="file" multiple onChange={handleFileUpload} />
                <div className="grid grid-cols-2 gap-2">
                  {files.map(file => (
                    <div key={file.name} className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md">
                      <p className="text-xs truncate">{file.name}</p>
                      {file.type.startsWith('image') && (
                        <img src={file.url} alt="" className="w-full h-20 object-cover rounded" />
                      )}
                      <button
                        onClick={() => handleRemoveFile(file.name)}
                        className="text-red-500 text-xs mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 📆 Due Date Picker */}
          <div>
            <button
              className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400"
              onClick={() => setOpenSection(openSection === 'duedate' ? null : 'duedate')}
            >
              <CalendarIcon className="w-4 h-4" />
              Set Due Date
            </button>
            {openSection === 'duedate' && (
              <div className="mt-2">
                <DatePicker
                  selected={dueDate}
                  onChange={(date: Date | null) => setDueDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full p-2 rounded-md border dark:bg-zinc-800 dark:text-white"
                  placeholderText="Select a date"
                />
                {dueDate && (
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    Selected: {format(dueDate, 'PPpp')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 💬 Comments Section */}
          <div>
            <button
              className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400"
              onClick={() => setOpenSection(openSection === 'comments' ? null : 'comments')}
            >
              <MessageSquareIcon className="w-4 h-4" />
              Comments
            </button>
            {openSection === 'comments' && (
              <div className="mt-2 space-y-2">
                {comments.length > 0 ? (
                  <ul className="space-y-1">
                    {comments.map((comment, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md">
                        {comment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment"
                  />
                  <Button onClick={handleAddComment}>Add</Button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full mt-4">
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditTicketModal;
