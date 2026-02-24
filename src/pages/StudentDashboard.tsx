import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, BarChart3, Clock, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Exams', value: '12', icon: GraduationCap },
  { label: 'Results Out', value: '10', icon: BarChart3 },
  { label: 'Pending', value: '2', icon: Clock },
  { label: 'Avg Score', value: '78%', icon: TrendingUp },
];

const results = [
  { exam: 'Mathematics Final', score: 87, total: 100 },
  { exam: 'Physics Midterm', score: 72, total: 100 },
  { exam: 'Chemistry Quiz', score: 95, total: 100 },
];

const performance = [
  { label: 'Total', value: '12' },
  { label: 'Evaluated', value: '10' },
  { label: 'Pending', value: '2' },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, Alice</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Results */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">My Results</h2>
            </div>
            <div className="divide-y divide-border">
              {results.map((r) => (
                <div key={r.exam} className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{r.exam}</p>
                    <p className="text-sm font-mono text-foreground">{r.score}/{r.total}</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(r.score / r.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Performance</h2>
            </div>
            <div className="p-5 flex flex-col items-center gap-6">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-secondary" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-primary" strokeWidth="8" strokeDasharray={`${78 * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold font-mono text-foreground">78%</p>
                </div>
              </div>
              <div className="grid w-full grid-cols-3 gap-3">
                {performance.map((p) => (
                  <div key={p.label} className="rounded-lg bg-secondary p-3 text-center">
                    <p className="text-sm text-muted-foreground">{p.label}</p>
                    <p className="text-lg font-bold font-mono text-foreground">{p.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
