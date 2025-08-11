import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  userData?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, mode, userData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    avatar: '',
    file: null as File | null,
  });

  const isView = mode === 'view';
  const [department, setDepartment] = useState("");

    const departments = [
    { key: "none", label: "None" },
    { key: "management", label: "Management" },
    { key: "claims", label: "Claims" },
    { key: "underwriting", label: "Underwriting" },
    { key: "ict", label: "ICT" },
    { key: "finance_admin", label: "Finance & Administration" },
    { key: "operations", label: "Operations" },
    { key: "hr", label: "HR" },
    { key: "marketing", label: "Marketing" },
    { key: "business_development", label: "Business Development" },
    { key: "legal", label: "Legal" },
    { key: "sales", label: "Sales" },
    { key: "customer_service", label: "Customer Service" },
    { key: "procurement", label: "Procurement" },
    { key: "product_management", label: "Product Management" },
    { key: "project_management", label: "Project Management" },
    { key: "data_analysis", label: "Data Analysis" },
  ];

  // Reset form data when modal opens/closes or mode/userData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'add') {
        setFormData({ name: '', email: '', role: 'user', avatar: '', file: null });
      } else if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'user',
          avatar: userData.avatar || '',
          file: null,
        });
      }
    }
  }, [isOpen, mode, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        file,
        avatar: URL.createObjectURL(file),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    toast.success(
      mode === 'edit' ? '✅ Changes saved!' : '🎉 User added successfully!',
      { autoClose: 3000 }
    );
    onClose();
  };

  const avatarFallback = formData.name
    ? formData.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent forceMount className="p-0 bg-transparent border-none max-w-md w-full">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={`w-full rounded-2xl shadow-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6`}
            >
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold">
                  {mode === 'add'
                    ? 'Add New User'
                    : mode === 'edit'
                    ? 'Edit User'
                    : 'User Info'}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-20 h-20 ring ring-offset-2 ring-gray-300 dark:ring-white">
                  <AvatarImage src={formData.avatar} alt="avatar" />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>

                {isView ? (
                  <div className="w-full space-y-3 mt-4 text-center">
                    <p className="text-lg font-semibold">{formData.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formData.email}</p>
                    <span className="inline-block text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full capitalize">
                      {formData.role}
                    </span>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                          required
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <select
                        id="department"
                        name="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
           x             required
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
                      >
                        <option value="" disabled>Select your department</option>
                        {departments.map((dept) => (
                          <option key={dept.key} value={dept.key}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Upload Avatar</Label>
                      <Input type="file" name="file" onChange={handleChange} />
                    </div>
                  </div>
                )}
              </div>

              {!isView && (
                <DialogFooter className="mt-6">
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {mode === 'edit' ? 'Save Changes' : 'Add User'}
                  </Button>
                </DialogFooter>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
