import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const subjects = [
  { code: 'MATH101', name: 'Mathematics', description: 'Calculus, Algebra, and Statistics' },
  { code: 'PHY201', name: 'Physics', description: 'Mechanics, Thermodynamics, and Optics' },
  { code: 'CHEM101', name: 'Chemistry', description: 'Organic and Inorganic Chemistry' },
  { code: 'ENG102', name: 'English', description: 'Literature and Composition' },
  { code: 'BIO301', name: 'Biology', description: 'Cell Biology and Genetics' },
];

export default function AdminManageSubjects() {
  const [search, setSearch] = useState('');

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Subjects</h1>
            <p className="text-sm text-muted-foreground">Create and manage subjects</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search subjects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Code', 'Name', 'Description', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.code} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-primary">{s.code}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.description}</td>
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
      </motion.div>
    </DashboardLayout>
  );
}
