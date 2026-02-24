import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Clock, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const questions = [
  { q: 1, answer: 'The derivative of x² is 2x by the power rule...', modelAnswer: 'f\'(x) = 2x using d/dx(xⁿ) = nxⁿ⁻¹', feedback: 'Correct application of power rule. Full marks.', marks: '10/10' },
  { q: 2, answer: 'Integration by parts: ∫u dv = uv - ∫v du...', modelAnswer: '∫u dv = uv - ∫v du, with proper substitution', feedback: 'Correct formula but missing final substitution step.', marks: '7/10' },
  { q: 3, answer: 'The limit approaches infinity as x→0...', modelAnswer: 'Factor and cancel: limit = 2', feedback: 'Incorrect. The limit is 2. Review L\'Hôpital\'s rule.', marks: '3/10' },
];

export default function StudentResultDetail() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/my-results" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Result Detail</h1>
            <p className="text-sm text-muted-foreground">Mathematics Final — Detailed breakdown</p>
          </div>
        </div>

        {/* Score hero */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-secondary" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-primary" strokeWidth="8" strokeDasharray={`${78 * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold font-mono text-foreground">78%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>Grade: <strong className="text-foreground">B+</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>3 Questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Feb 15, 2026</span>
              </div>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Question-wise Marks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Q#', 'Your Answer', 'Model Answer', 'AI Feedback', 'Marks'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {questions.map((row) => (
                  <tr key={row.q} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-foreground">{row.q}</td>
                    <td className="px-5 py-4 text-foreground max-w-[180px]">{row.answer}</td>
                    <td className="px-5 py-4 text-muted-foreground max-w-[180px]">{row.modelAnswer}</td>
                    <td className="px-5 py-4 text-muted-foreground max-w-[200px]">{row.feedback}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ${
                        row.marks.startsWith('10') ? 'bg-success/10 text-success' : 
                        parseInt(row.marks) >= 7 ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {row.marks}
                      </span>
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
