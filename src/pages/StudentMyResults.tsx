import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trophy, BarChart3, Award, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Exams', value: '12', icon: BarChart3 },
  { label: 'Avg Score', value: '78%', icon: Trophy },
  { label: 'Best Score', value: '95%', icon: Award },
];

const results = [
  { exam: 'Mathematics Final', subject: 'Mathematics', date: '2026-02-15', score: 87, total: 100, grade: 'A' },
  { exam: 'Physics Midterm', subject: 'Physics', date: '2026-02-10', score: 72, total: 100, grade: 'B' },
  { exam: 'Chemistry Quiz', subject: 'Chemistry', date: '2026-01-28', score: 95, total: 100, grade: 'A+' },
  { exam: 'English Essay', subject: 'English', date: '2026-01-20', score: 68, total: 100, grade: 'B-' },
];

export default function StudentMyResults() {
  const [search, setSearch] = useState('');

  const filtered = results.filter(r =>
    r.exam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Results</h1>
          <p className="text-sm text-muted-foreground">View all your exam results</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search results..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.exam} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{r.exam}</p>
                    <p className="text-sm text-muted-foreground">{r.subject} · {r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-bold text-foreground">{r.score}/{r.total}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.grade.startsWith('A') ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {r.grade}
                    </span>
                  </div>
                  <Link to="/result-detail">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${r.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
