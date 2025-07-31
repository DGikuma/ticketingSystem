import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Paperclip, Calendar, MessageSquareText } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface TicketData {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date;
  attachments: Attachment[];
  comments: Comment[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  ticket: TicketData;
}

const ViewTicketModal: React.FC<Props> = ({ open, onClose, ticket }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full dark:bg-zinc-900 bg-white p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-primary">
            📝 View Ticket - {ticket.subject}
          </DialogTitle>
        </DialogHeader>

        {/* Details */}
        <div className="space-y-2 mt-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Ticket Details</h3>
          <p className="text-gray-700 dark:text-gray-300">{ticket.description}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white">
              Status: {ticket.status}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white">
              Priority: {ticket.priority}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-white">
              ID: {ticket.id}
            </Badge>
          </div>
        </div>

        {/* Due Date */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-teal-500" />
            <h4 className="text-md font-medium text-muted-foreground">Due Date</h4>
          </div>
          <DatePicker
            selected={ticket.dueDate}
            onChange={() => {}}
            readOnly
            className="cursor-not-allowed"
            showPopperArrow={false}
            dateFormat="PPPP"
          />
        </div>

        {/* Attachments */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-1">
            <Paperclip className="w-5 h-5 text-pink-500" />
            <h4 className="text-md font-medium text-muted-foreground">Attachments</h4>
          </div>
          {ticket.attachments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No attachments</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              {ticket.attachments.map((file, index) => (
                <div
                  key={index}
                  className="border p-2 rounded-lg dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-center"
                >
                  {file.type.startsWith("image") ? (
                    <img src={file.url} alt={file.name} className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="text-sm truncate text-blue-600 dark:text-blue-400">
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        {file.name}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareText className="w-5 h-5 text-green-500" />
            <h4 className="text-md font-medium text-muted-foreground">Comments</h4>
          </div>
          {ticket.comments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No comments yet.</p>
          ) : (
            <div className="space-y-3 mt-3 max-h-60 overflow-y-auto pr-2">
              {ticket.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{comment.author}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="secondary" className="rounded-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTicketModal;
