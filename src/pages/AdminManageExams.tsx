import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, Clock, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const exams = [
  { id: 1, title: 'Mathematics Final', subject: 'Mathematics', date: '2026-03-15', duration: '3h', questions: 10, status: 'Active' },
  { id: 2, title: 'Physics Midterm', subject: 'Physics', date: '2026-03-10', duration: '2h', questions: 8, status: 'Active' },
  { id: 3, title: 'Chemistry Quiz', subject: 'Chemistry', date: '2026-02-28', duration: '1h', questions: 5, status: 'Completed' },
  { id: 4, title: 'English Essay', subject: 'English', date: '2026-03-20', duration: '2h', questions: 3, status: 'Draft' },
  { id: 5, title: 'Biology Lab Test', subject: 'Biology', date: '2026-03-25', duration: '1.5h', questions: 6, status: 'Draft' },
  { id: 6, title: 'History Exam', subject: 'History', date: '2026-04-01', duration: '2.5h', questions: 12, status: 'Active' },
];

export default function AdminManageExams() {
  const [search, setSearch] = useState('');

  const filtered = exams.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Exams</h1>
            <p className="text-sm text-muted-foreground">Create and manage all examinations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search exams..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => (
            <div key={exam.id} className="rounded-xl border border-border bg-card p-5 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{exam.title}</h3>
                  <p className="text-sm text-muted-foreground">{exam.subject}</p>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  exam.status === 'Active' ? 'bg-success/10 text-success' :
                  exam.status === 'Completed' ? 'bg-primary/10 text-primary' :
                  'bg-warning/10 text-warning'
                }`}>
                  {exam.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{exam.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.duration}</span>
                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{exam.questions}Q</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="mr-2 h-3.5 w-3.5" />
                View Details
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
