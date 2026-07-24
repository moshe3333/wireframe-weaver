import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Mail, Shield, Hash, Calendar, Loader2 } from 'lucide-react';
import API_BASE, { getAuthData } from '@/lib/api';

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const auth = getAuthData();
    if (auth.token && auth.uid) {
      fetch(`${API_BASE}/users/${auth.uid}`)
        .then(res => res.json())
        .then(data => {
          setUserData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Profile fetch error:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const info = [
    { label: 'Full Name', value: userData?.fullName || 'User', icon: User },
    { label: 'Email', value: userData?.email || 'N/A', icon: Mail },
    { label: 'User ID', value: userData?.id || 'N/A', icon: Hash },
  ];

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
              <p className="text-lg font-semibold text-foreground">{userData?.fullName || 'User'}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {userData?.email}
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

