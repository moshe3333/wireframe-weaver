import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Loader2, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import API_BASE from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface Question {
  id: string;
  q: number;
  question: string;
  modelAnswer: string;
  maxMarks: number;
}

export default function AdminModelAnswers() {
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const [newQuestion, setNewQuestion] = useState({
    q: 1,
    question: '',
    modelAnswer: '',
    maxMarks: 10
  });

  // Fetch all exams for the dropdown
  const { data: exams = [], isLoading: examsLoading, isError: examsError } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/exams`);
      if (!res.ok) throw new Error('Failed to fetch exams');
      const data = await res.json();
      if (data.length > 0 && !selectedExamId) {
        setSelectedExamId(String(data[0].id));
      }
      return data;
    },
    refetchInterval: 5000,
    retry: 1,
  });

  // Fetch questions for the selected exam
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', selectedExamId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/exams/${selectedExamId}/questions`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      return res.json() as Promise<Question[]>;
    },
    enabled: !!selectedExamId,
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: async (q: any) => {
      const res = await fetch(`${API_BASE}/exams/${selectedExamId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });
      if (!res.ok) throw new Error('Failed to save model answer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedExamId] });
      toast.success('Model answer saved successfully');
      setIsDialogOpen(false);
      setNewQuestion({ q: questions.length + 2, question: '', modelAnswer: '', maxMarks: 10 });
    },
    onError: (err) => {
      toast.error('Error saving model answer');
      console.error(err);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const res = await fetch(`${API_BASE}/exams/${selectedExamId}/questions/${questionId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete question');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedExamId] });
      toast.success('Question removed from Answer Key');
    },
    onError: (err) => {
      toast.error('Error deleting question');
      console.error(err);
    }
  });

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      toast.error('Please select an exam first');
      return;
    }
    createMutation.mutate(newQuestion);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this question from the Model Answer Key?')) {
      deleteMutation.mutate(id);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (!selectedExamId) {
      toast.error('Select an exam first');
      return;
    }

    const file = e.target.files[0];
    toast.loading('Importing answer key file...', { id: 'ocr-key' });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/exams/${selectedExamId}/import-key`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to import answer key');

      queryClient.invalidateQueries({ queryKey: ['questions', selectedExamId] });
      toast.success(`Answer key imported. ${data.imported || 0} questions added.`, { id: 'ocr-key' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to import answer key', { id: 'ocr-key' });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Model Answers (Answer Key)</h1>
            <p className="text-sm text-muted-foreground">Define the correct answers for AI-assisted grading</p>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleKeyUpload} 
              accept=".json,.pdf,.jpg,.jpeg,.png"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!selectedExamId}>
              <FileText className="mr-2 h-4 w-4" />
              Upload Key Paper
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedExamId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Model Answer</DialogTitle>
                  <DialogDescription>
                    Enter the question text and the expected correct answer.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddQuestion} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="qnum" className="text-right">Q. No</Label>
                    <Input 
                      id="qnum" 
                      type="number" 
                      title="Question Number"
                      placeholder="No"
                      className="col-span-1" 
                      value={newQuestion.q} 
                      onChange={e => setNewQuestion({...newQuestion, q: parseInt(e.target.value)})}
                    />
                    <Label htmlFor="marks" className="text-right">Marks</Label>
                    <Input 
                      id="marks" 
                      type="number" 
                      title="Maximum Marks"
                      placeholder="Marks"
                      className="col-span-1" 
                      value={newQuestion.maxMarks} 
                      onChange={e => setNewQuestion({...newQuestion, maxMarks: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question">Question Text</Label>
                    <Textarea 
                      id="question" 
                      placeholder="Enter the exam question here..." 
                      value={newQuestion.question} 
                      onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Correct Model Answer</Label>
                    <Textarea 
                      id="answer" 
                      placeholder="Enter the ideal answer that students should provide..." 
                      value={newQuestion.modelAnswer} 
                      onChange={e => setNewQuestion({...newQuestion, modelAnswer: e.target.value})}
                      required
                      className="h-32"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Question
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Select Exam:</span>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger className="w-[300px] bg-background">
                <SelectValue placeholder={examsLoading ? "Loading exams..." : "Choose an examination"} />
              </SelectTrigger>
              <SelectContent>
                {exams.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>{e.title} ({e.subject})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {examsLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {examsError && <p className="text-xs text-destructive">Failed to load exams. Check backend connection.</p>}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Admin JSON Upload Format</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Use this JSON structure when uploading question-answer data in bulk.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-secondary/40 p-3 text-xs text-foreground">
{`{
  "qa": [
    {
      "question": "What is your name?",
      "answer": "My name is Ravi."
    },
    {
      "question": "How old are you?",
      "answer": "I am 7 years old."
    },
    {
      "question": "What color is the sky?",
      "answer": "The sky is blue."
    },
    {
      "question": "How many legs does a dog have?",
      "answer": "A dog has four legs."
    },
    {
      "question": "What do you eat in the morning?",
      "answer": "I eat breakfast in the morning."
    }
  ]
}`}
          </pre>
        </div>

        <div className="space-y-4">
          {questionsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground animate-pulse">Syncing Answer Key...</p>
            </div>
          ) : !selectedExamId ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-20 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Select an exam to view and manage its answer key.</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-20 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium text-lg">No questions added yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click the "Add Question" button above to start building the Answer Key.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {questions.map((q) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  key={q.id} 
                  className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/20">
                        {q.q}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Question {q.q}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Points: {q.maxMarks}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(q.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-tighter font-bold text-muted-foreground">Question</Label>
                      <div className="rounded-lg bg-secondary/50 p-4 text-sm font-medium border border-border/50">
                        {q.question}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-tighter font-bold text-primary/70">Model Answer</Label>
                      <div className="rounded-lg bg-primary/5 p-4 text-sm text-foreground border border-primary/20 italic">
                        {q.modelAnswer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
