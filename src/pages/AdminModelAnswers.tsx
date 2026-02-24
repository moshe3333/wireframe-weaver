import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText } from 'lucide-react';

const questions = [
  {
    q: 1,
    question: 'Find the derivative of f(x) = x³ + 2x² - 5x + 3',
    modelAnswer: 'f\'(x) = 3x² + 4x - 5. Apply power rule to each term separately.',
    maxMarks: 10,
  },
  {
    q: 2,
    question: 'Evaluate the integral ∫(2x + 3)dx',
    modelAnswer: '∫(2x + 3)dx = x² + 3x + C. Use basic integration rules.',
    maxMarks: 10,
  },
  {
    q: 3,
    question: 'Find the limit of (x² - 1)/(x - 1) as x approaches 1',
    modelAnswer: 'Factor numerator: (x+1)(x-1)/(x-1) = x+1. At x=1, limit = 2.',
    maxMarks: 10,
  },
];

export default function AdminModelAnswers() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Model Answers</h1>
            <p className="text-sm text-muted-foreground">Manage model answers for AI evaluation</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Exam:</span>
          <Select defaultValue="math">
            <SelectTrigger className="w-[250px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Mathematics Final</SelectItem>
              <SelectItem value="physics">Physics Midterm</SelectItem>
              <SelectItem value="chemistry">Chemistry Quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.q} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-semibold text-primary">
                    {q.q}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Max: {q.maxMarks} marks</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Question</p>
                <p className="text-sm text-muted-foreground bg-secondary rounded-lg p-3">{q.question}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Model Answer</p>
                <p className="text-sm text-muted-foreground bg-secondary rounded-lg p-3">{q.modelAnswer}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
