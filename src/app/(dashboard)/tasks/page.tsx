'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Pending',
  });

  // Confirm Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success) setMembersList(data.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: membersList[0]?._id || '',
      deadline: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Pending',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (t: any) => {
    setEditingTask(t);
    setFormData({
      title: t.title,
      description: t.description || '',
      assignedTo: t.assignedTo?._id || t.assignedTo,
      deadline: new Date(t.deadline).toISOString().split('T')[0],
      priority: t.priority,
      status: t.status,
    });
    setModalOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) {
      alert('Title and Assigned Member are required');
      return;
    }

    setActionLoading(true);

    try {
      const url = editingTask ? `/api/tasks/${editingTask._id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setModalOpen(false);
        fetchTasks();
      } else {
        alert(data.message || 'Failed to save task');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskToDelete._id}`, { method: 'DELETE' });
      const data = await res.json();
      setActionLoading(false);
      if (data.success) {
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
        fetchTasks();
      } else {
        alert(data.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-amber-600" />
            Committee Task Assignments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Assign duties to the 13 members for lighting, pandal, sound, prasad, and police NOC permissions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl gradient-maroon text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="space-y-4 bg-amber-50/40 p-4 rounded-3xl border border-amber-100/80">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending ({pendingTasks.length})
            </h3>
          </div>
          {pendingTasks.map((t) => (
            <TaskCard
              key={t._id}
              task={t}
              onEdit={handleOpenEditModal}
              onDelete={(task) => {
                setTaskToDelete(task);
                setDeleteDialogOpen(true);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {/* In Progress Column */}
        <div className="space-y-4 bg-blue-50/40 p-4 rounded-3xl border border-blue-100/80">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              In Progress ({inProgressTasks.length})
            </h3>
          </div>
          {inProgressTasks.map((t) => (
            <TaskCard
              key={t._id}
              task={t}
              onEdit={handleOpenEditModal}
              onDelete={(task) => {
                setTaskToDelete(task);
                setDeleteDialogOpen(true);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {/* Completed Column */}
        <div className="space-y-4 bg-emerald-50/40 p-4 rounded-3xl border border-emerald-100/80">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Completed ({completedTasks.length})
            </h3>
          </div>
          {completedTasks.map((t) => (
            <TaskCard
              key={t._id}
              task={t}
              onEdit={handleOpenEditModal}
              onDelete={(task) => {
                setTaskToDelete(task);
                setDeleteDialogOpen(true);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task Assignment' : 'Assign New Committee Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Task Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lighting Arrangement & Gate Setup"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Member</label>
              <select
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose Member --</option>
                {membersList.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deadline Date</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Task Instructions / Details</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide specific instructions or contact info..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingTask ? 'Update Task' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: any;
  onEdit: (t: any) => void;
  onDelete: (t: any) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-festive hover:shadow-festive-lg transition-all">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-gray-900 text-sm leading-snug">{task.title}</h4>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex-shrink-0 ${
            task.priority === 'High'
              ? 'bg-rose-100 text-rose-800'
              : task.priority === 'Medium'
              ? 'bg-amber-100 text-amber-900'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2 font-medium">{task.description}</p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-200 text-maroon-900 font-bold text-[10px] flex items-center justify-center">
            {task.assignedTo?.name?.charAt(0) || 'M'}
          </div>
          <span className="font-bold text-gray-800 text-[11px]">{task.assignedTo?.name || 'Unassigned'}</span>
        </div>

        <span className="text-[10px] text-gray-400 font-medium">Due: {formatDate(task.deadline)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-amber-500"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-600">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(task)} className="p-1 text-gray-400 hover:text-rose-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
