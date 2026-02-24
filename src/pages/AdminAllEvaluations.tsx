import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const evaluations = [
  { student: 'Alice Johnson', exam: 'Math Final', date: '2026-02-15', status: 'Completed', score: '87/100' },
  { student: 'Bob Smith', exam: 'Physics Mid', date: '2026-02-10', status: 'Completed', score: '72/100' },
  { student: 'Carol Davis', exam: 'Chemistry Quiz', date: '2026-02-08', status: 'Pending', score: '—' },
  { student: 'David Lee', exam: 'Math Final', date: '2026-02-15', status: 'Completed', score: '91/100' },
  { student: 'Eva Martinez', exam: 'English Essay', date: '2026-02-12', status: 'Failed', score: '—' },
];

export default function AdminAllEvaluations() {
  const [search, setSearch] = useState('');

  const filtered = evaluations.filter(e =>
    e.student.toLowerCase().includes(search.toLowerCase()) ||
    e.exam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Evaluations</h1>
          <p className="text-sm text-muted-foreground">View all AI-evaluated answer sheets</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by student or exam..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Exam" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              <SelectItem value="math">Math Final</SelectItem>
              <SelectItem value="physics">Physics Mid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Student', 'Exam', 'Date', 'Status', 'Score', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e, i) => (
                  <tr key={i} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{e.student}</td>
                    <td className="px-5 py-3.5 text-foreground">{e.exam}</td>
                    <td className="px-5 py-3.5 font-mono text-muted-foreground">{e.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        e.status === 'Completed' ? 'bg-success/10 text-success' :
                        e.status === 'Pending' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-foreground">{e.score}</td>
                    <td className="px-5 py-3.5">
                      <Link to="/eval-details" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors inline-flex">
                        <Eye className="h-4 w-4" />
                      </Link>
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
