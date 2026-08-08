'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Shield, Eye, RefreshCw, X, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';
import { apiClient } from '@/lib/api-client';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected User Modal / Action States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'reactivate';
    userId: string;
    username: string;
  }>({ isOpen: false, type: 'suspend', userId: '', username: '' });

  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users', {
        params: {
          query: search || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch users list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenDetail = async (userId: string) => {
    try {
      const res = await apiClient.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to fetch user details', err);
    }
  };

  const handleConfirmSuspendToggle = async () => {
    setActionLoading(true);
    setAlertMsg(null);
    try {
      if (confirmDialog.type === 'suspend') {
        await apiClient.post(`/admin/users/${confirmDialog.userId}/suspend`, { reason: 'Admin moderation' });
        setAlertMsg({ text: `User ${confirmDialog.username} has been suspended.` });
      } else {
        await apiClient.post(`/admin/users/${confirmDialog.userId}/reactivate`);
        setAlertMsg({ text: `User ${confirmDialog.username} has been reactivated.` });
      }
      fetchUsers();
    } catch (err: any) {
      setAlertMsg({ text: err.response?.data?.detail || 'Action failed.', isError: true });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole) return;
    setActionLoading(true);
    setAlertMsg(null);
    try {
      await apiClient.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
      setAlertMsg({ text: `Updated ${selectedUser.username}'s role to ${newRole}.` });
      setShowRoleModal(false);
      fetchUsers();
    } catch (err: any) {
      setAlertMsg({ text: err.response?.data?.detail || 'Failed to update role.', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">User Management</h1>
            <p className="text-xs text-zinc-400 mt-1">Search, suspend/reactivate accounts, and manage role permissions.</p>
          </div>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            Total Accounts: {total}
          </span>
        </div>

        {alertMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
              alertMsg.isError
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <span>{alertMsg.text}</span>
            <button onClick={() => setAlertMsg(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2 text-xs font-medium text-white shadow-sm focus:border-indigo-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="registered_user">Registered User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">No users match your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-white">{u.full_name || u.username}</div>
                          <div className="text-[11px] text-zinc-500">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={u.role} type="role" />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={u.is_active ? 'Active' : 'Suspended'} type="user_status" />
                      </td>
                      <td className="p-4 text-zinc-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDetail(u.id)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                          title="View user details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role);
                            setShowRoleModal(true);
                          }}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-indigo-400 hover:bg-indigo-950/40"
                          title="Change Role"
                        >
                          <Shield className="h-4 w-4" />
                        </button>

                        {u.is_active ? (
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: 'suspend',
                                userId: u.id,
                                username: u.username,
                              })
                            }
                            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-rose-400 hover:bg-rose-950/40"
                            title="Suspend Account"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: 'reactivate',
                                userId: u.id,
                                username: u.username,
                              })
                            }
                            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-emerald-400 hover:bg-emerald-950/40"
                            title="Reactivate Account"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">User Metadata & Activity</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 font-semibold">User ID:</span>
                  <p className="text-zinc-200 font-mono text-[10px] break-all">{selectedUser.id}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-semibold">Clerk ID:</span>
                  <p className="text-zinc-200 font-mono text-[10px] break-all">{selectedUser.clerk_id}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-semibold">Username:</span>
                  <p className="text-white font-bold">{selectedUser.username}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-semibold">Email:</span>
                  <p className="text-zinc-300">{selectedUser.email}</p>
                </div>
              </div>

              {/* Telemetry metadata stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-indigo-400 font-bold text-lg">{selectedUser.stats?.surveys_count || 0}</span>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Surveys</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-emerald-400 font-bold text-lg">{selectedUser.stats?.posts_count || 0}</span>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Posts</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-amber-400 font-bold text-lg">{selectedUser.stats?.saved_gifts_count || 0}</span>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Saved Gifts</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <span className="text-rose-400 font-bold text-lg">{selectedUser.stats?.plans_count || 0}</span>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">Plans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Modification Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Change User Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Updating role for user <span className="text-white font-bold">{selectedUser.username}</span>.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Select New Role:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="registered_user">Registered User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Note: Granting or modifying Admin privileges requires SUPER_ADMIN credentials.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRoleModal(false)}
                className="rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={actionLoading}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                {actionLoading ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleConfirmSuspendToggle}
        title={confirmDialog.type === 'suspend' ? 'Suspend User Account' : 'Reactivate User Account'}
        description={
          confirmDialog.type === 'suspend'
            ? `Are you sure you want to suspend ${confirmDialog.username}? They will be blocked from accessing authenticated APIs.`
            : `Reactivate ${confirmDialog.username}'s account? They will regain access to their dashboard.`
        }
        confirmText={confirmDialog.type === 'suspend' ? 'Suspend Account' : 'Reactivate Account'}
        isDangerous={confirmDialog.type === 'suspend'}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
