import React from 'react';

interface FiltersProps {
  status: string;
  department: string;
  onFilterChange: (filter: { status: string; department: string }) => void;
}

export default function Filters({ status, department, onFilterChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <select
        value={status}
        onChange={e => onFilterChange({ status: e.target.value, department })}
        className="border rounded p-2 dark:bg-gray-800 dark:text-white"
      >
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
      <select
        value={department}
        onChange={e => onFilterChange({ status, department: e.target.value })}
        className="border rounded p-2 dark:bg-gray-800 dark:text-white"
      >
        <option value="">All Departments</option>
        <option value="support">Support</option>
        <option value="billing">Billing</option>
        <option value="technical">Technical</option>
      </select>
    </div>
  );
}
