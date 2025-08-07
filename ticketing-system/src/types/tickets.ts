export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  department: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  createdBy: string;
  comments: Comment[];
  attachments?: string[];
}
