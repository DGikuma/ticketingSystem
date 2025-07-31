import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import UserModal from '@/components/UserModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatar?: string;
}

const DUMMY_USERS: User[] = Array.from({ length: 37 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 5 === 0 ? 'admin' : 'user',
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
}));

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const USERS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setUsers(DUMMY_USERS);
    } catch (error) {
      toast.error('❌ Failed to fetch users');
    }
  };

  const handleSort = (field: 'name' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filtered = useMemo(() => {
    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
  }, [users, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

return (
  <div className="p-6 space-y-6 bg-gradient-to-tr from-neutral-100 via-white to-neutral-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen rounded-xl shadow-xl">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
        <Users className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
        Agent Management
      </h2>
      <Button onClick={() => { setModalType('edit'); setSelectedUser(null); }}>
        + Add User
      </Button>
    </div>

    <div className="relative w-full sm:max-w-xs">
    <Search className="absolute top-2.5 left-3 text-gray-500" size={18} />
    <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
        }}
        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-inner focus:ring-2 ring-gray-500 focus:outline-none text-sm"
    />
    </div>

    <div className="overflow-x-auto rounded-xl shadow-2xl border border-neutral-200 dark:border-gray-700">
      <table className="w-full table-auto text-sm bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-neutral-600 to-gray-500 text-white text-left text-sm uppercase">
          <tr>
            <th className="p-3">Avatar</th>
            <th className="p-3 cursor-pointer" onClick={() => handleSort('name')}>
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3 cursor-pointer" onClick={() => handleSort('created_at')}>
              Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user) => (
            <motion.tr
              key={user.id}
              className="border-b even:bg-gray-50 dark:even:bg-gray-900/60 text-gray-700 dark:text-gray-200 transition duration-300 ease-in-out hover:bg-neutral-200 dark:hover:bg-gray-700/80 hover:shadow-md hover:scale-[1.01] cursor-pointer rounded-xl hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 dark:hover:ring-gray-600"
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedUser(user)}
            >
              <td className="p-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </td>
              <td className="p-3 font-semibold">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white shadow ${
                  user.role === 'admin'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    : 'bg-gradient-to-r from-green-400 to-emerald-500'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-32 dark:bg-neutral-900">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setModalType('view');
                      setSelectedUser(user);
                    }}>
                      <Eye className="h-4 w-4 text-blue-500 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setModalType('edit');
                      setSelectedUser(user);
                    }}>
                      <Pencil className="h-4 w-4 text-yellow-500 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setModalType('delete');
                      setSelectedUser(user);
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-300">
      <span>
        Showing page <b>{currentPage}</b> of {totalPages}
      </span>
      <div className="space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              currentPage === i + 1
                ? 'bg-neutral-700 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-neutral-200 dark:hover:bg-gray-800'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>

    <AnimatePresence>
      {modalType && (
        <UserModal
          isOpen={!!modalType}
          onClose={() => {
            setModalType(null);
            setSelectedUser(null);
          }}
          onSave={(updatedUser) => {
            toast.success(
              modalType === 'edit'
                ? '✅ Changes saved!'
                : '🎉 User added successfully!',
              { autoClose: 4000 }
            );

            if (modalType === 'edit' && selectedUser) {
              setUsers((prev) =>
                prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u))
              );
            } else {
              setUsers((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  created_at: new Date().toISOString(),
                  ...updatedUser,
                },
              ]);
            }

            setModalType(null);
            setSelectedUser(null);
          }}
          mode={modalType}
          userData={selectedUser || undefined}
        />
      )}
    </AnimatePresence>
  </div>
);

};

export default UserManagement;