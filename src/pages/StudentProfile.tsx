import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Mail, Shield, Hash, Calendar } from 'lucide-react';

const info = [
  { label: 'Full Name', value: 'Alice Johnson', icon: User },
  { label: 'Email', value: 'alice@university.edu', icon: Mail },
  { label: 'Roll Number', value: 'CS2024001', icon: Hash },
  { label: 'Joined Date', value: 'September 1, 2025', icon: Calendar },
];

export default function StudentProfile() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
          <p className="text-sm text-muted-foreground">Your account information</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Alice Johnson</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                alice@university.edu
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Student
              </div>
            </div>
          </div>

          {/* Account info */}
          <div>
            <h2 className="font-semibold text-foreground mb-4">Account Info</h2>
            <div className="space-y-3">
              {info.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg bg-secondary p-3.5">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
