import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Trophy, BarChart3, Award, Loader2, Download } from 'lucide-react';
import API_BASE, { getAuthData } from '@/lib/api';

export default function StudentResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('student');

  useEffect(() => {
    let active = true;

    async function init() {
      const auth = getAuthData();
      if (auth.token && auth.uid) {
        const roleValue = (auth.role || 'student').toLowerCase();
        if (active) setRole(roleValue);
        
        try {
          const url = roleValue === 'admin' 
            ? `${API_BASE}/evaluations`
            : `${API_BASE}/evaluations?roll_number=${auth.uid}`;
            
          const resp = await fetch(url);
          const data = await resp.json();
          
          if (Array.isArray(data)) {
            const mapped = data.map(r => ({
              id: r._id,
              exam: r.exam_id || 'Unknown Exam',
              student: r.roll_number,
              date: new Date(r.timestamp).toLocaleDateString(),
              marks: `${r.score}/${r.total}`,
              pct: r.percentage?.replace('%', '') || '0',
              grade: r.grade || 'N/A'
            }));
            if (active) setResults(mapped);
          }
        } catch (err) {
          console.error("Error fetching results:", err);
        }
      }
      if (active) setLoading(false);
    }

    init();

    const timer = setInterval(init, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const stats = [
    { label: 'Total Evaluations', value: results.length.toString(), icon: BarChart3 },
    { label: 'Avg Score', value: results.length > 0 ? (results.reduce((acc, r) => acc + parseInt(r.pct), 0) / results.length).toFixed(0) + '%' : '0%', icon: Trophy },
    { label: 'Best Performance', value: results.length > 0 ? Math.max(...results.map(r => parseInt(r.pct))) + '%' : '0%', icon: Award },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{role === 'admin' ? 'Reports' : 'My Results'}</h1>
            <p className="text-sm text-muted-foreground">{role === 'admin' ? 'View all student performance reports' : 'View your exam performance'}</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Download className="h-4 w-4" />
            Download CSV
          </button>
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

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Detailed Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Exam</th>
                  {role === 'admin' && <th className="px-5 py-3 text-left font-medium text-muted-foreground">Roll Number</th>}
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Marks</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">%</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.exam}</td>
                    {role === 'admin' && <td className="px-5 py-3.5 font-mono text-muted-foreground">{r.student}</td>}
                    <td className="px-5 py-3.5 font-mono text-muted-foreground">{r.date}</td>
                    <td className="px-5 py-3.5 font-mono text-foreground">{r.marks}</td>
                    <td className="px-5 py-3.5 font-mono text-foreground">{r.pct}%</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        r.grade === 'A' ? 'bg-success/10 text-success' : 
                        r.grade === 'B' ? 'bg-primary/10 text-primary' : 
                        'bg-warning/10 text-warning'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={role === 'admin' ? 6 : 5} className="px-5 py-10 text-center text-muted-foreground">No reports found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
