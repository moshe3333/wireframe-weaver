import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const users = [
  { name: 'Alice Johnson', email: 'alice@university.edu', role: 'Student', joined: '2025-09-01' },
  { name: 'Bob Smith', email: 'bob@university.edu', role: 'Student', joined: '2025-09-01' },
  { name: 'Dr. Carol Davis', email: 'carol@university.edu', role: 'Instructor', joined: '2025-08-15' },
  { name: 'David Lee', email: 'david@university.edu', role: 'Student', joined: '2025-09-10' },
  { name: 'Eva Martinez', email: 'eva@university.edu', role: 'Admin', joined: '2025-07-01' },
];

export default function AdminManageUsers() {
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
            <p className="text-sm text-muted-foreground">View and manage all platform users</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.email} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{u.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === 'Admin' ? 'bg-primary/10 text-primary' :
                        u.role === 'Instructor' ? 'bg-accent/10 text-accent' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-muted-foreground">{u.joined}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                p === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
