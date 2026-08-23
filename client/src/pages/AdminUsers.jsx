import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield } from 'lucide-react';
import { getUsers } from '../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchUserList = async () => {
      setLoading(true);
      try {
        const res = await getUsers(roleFilter);
        setUsers(res.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserList();
  }, [roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Account Directory</h1>
          <p className="text-xs text-slate-500">List of all registered patients, doctors, and admins</p>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none bg-white"
        >
          <option value="">All Roles</option>
          <option value="patient">Patients Only</option>
          <option value="doctor">Doctors Only</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading user directory...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">{u.name}</td>
                  <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'doctor'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{u.phone || 'N/A'}</td>
                  <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
