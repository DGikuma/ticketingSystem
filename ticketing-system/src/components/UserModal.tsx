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
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  userData?: {
    id?: number | string;
    name: string;
    email: string;
    role: string;
    department?: string;
    avatar?: string;
  };
  onUserAdded?: (user: any) => void;
  onUserUpdated?: (user: any) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  mode,
  userData,
  onUserAdded,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    avatar: '',
    department: '',
    file: null as File | null,
    password: '', // ✅ added
  });

  const isView = mode === 'view';

  const [showPassword, setShowPassword] = useState(false);

  const departments = [
    { key: 'none', label: 'None' },
    { key: 'management', label: 'Management' },
    { key: 'claims', label: 'Claims' },
    { key: 'underwriting', label: 'Underwriting' },
    { key: 'ict', label: 'ICT' },
    { key: 'finance_admin', label: 'Finance & Administration' },
    { key: 'operations', label: 'Operations' },
    { key: 'hr', label: 'HR' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'business_development', label: 'Business Development' },
    { key: 'legal', label: 'Legal' },
    { key: 'sales', label: 'Sales' },
    { key: 'customer_service', label: 'Customer Service' },
    { key: 'procurement', label: 'Procurement' },
    { key: 'product_management', label: 'Product Management' },
    { key: 'project_management', label: 'Project Management' },
    { key: 'data_analysis', label: 'Data Analysis' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (mode === 'add') {
        setFormData({
          name: '',
          email: '',
          role: 'user',
          avatar: '',
          department: '',
          file: null,
          password: '', // reset
        });
      } else if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'user',
          avatar: userData.avatar || '',
          department: userData.department || '',
          file: null,
          password: '', // empty by default for edit
        });
      }
    }
  }, [isOpen, mode, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
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

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("role", formData.role);
      form.append("department", formData.department);
      if (formData.file) form.append("avatar", formData.file);

      // only send password if creating OR user explicitly changed it
      if (formData.password?.trim()) {
        form.append("password", formData.password);
      }

      console.log("📤 Sending request with data:", {
        ...formData,
        hasFile: !!formData.file,
        hasPassword: !!formData.password,
        mode,
      });

      let response: Response | undefined;
      if (mode === "add") {
        console.log("➡️ POST /api/admin/users");
        response = await fetch("/api/admin/users", {
          method: "POST",
          body: form,
        });
      } else if (mode === "edit" && userData?.id) {
        console.log(`➡️ PUT /api/admin/users/${userData.id}`);
        response = await fetch(`/api/admin/users/${userData.id}`, {
          method: "PUT",
          body: form,
        });
      }

      console.log("⬅️ Response status:", response?.status);

      if (!response) throw new Error("No response returned");

      if (!response.ok) {
        // read backend error details
        const errText = await response.text();
        console.error("❌ Backend error:", errText);
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Response JSON:", result);

      if (mode === "add") {
        toast.success("🎉 User added successfully!");
        onUserAdded?.(result);
      } else {
        toast.success("✅ Changes saved!");
        onUserUpdated?.(result);
      }

      onClose();
    } catch (err) {
      console.error("❌ handleSave error:", err);
      toast.error(`❌ Failed to save user: ${err instanceof Error ? err.message : err}`);
    }
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
              className="w-full rounded-2xl shadow-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6"
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
                      <Input name="name" value={formData.name} onChange={handleChange} />
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
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
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
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                      >
                        <option value="" disabled>
                          Select your department
                        </option>
                        {departments.map(dept => (
                          <option key={dept.key} value={dept.key}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ✅ New Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative w-full">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          placeholder="Enter password"
                          className="w-full rounded-xl border px-3 py-2 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
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
