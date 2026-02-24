import { Link, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, Upload, FileCheck, BarChart3, Users, BookOpen, FileText, ClipboardList, GraduationCap, User, LogOut } from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/manage-users', icon: Users, label: 'Manage Users' },
  { to: '/manage-exams', icon: FileText, label: 'Manage Exams' },
  { to: '/manage-subjects', icon: BookOpen, label: 'Manage Subjects' },
  { to: '/upload', icon: Upload, label: 'Upload Papers' },
  { to: '/all-evaluations', icon: ClipboardList, label: 'All Evaluations' },
  { to: '/eval-details', icon: FileCheck, label: 'Eval Details' },
  { to: '/model-answers', icon: FileText, label: 'Model Answers' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const studentLinks = [
  { to: '/student-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-results', icon: BarChart3, label: 'My Results' },
  { to: '/student-profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Determine which nav to show based on current route
  const isStudentRoute = ['/student-dashboard', '/my-results', '/result-detail', '/student-profile'].includes(location.pathname);
  const links = isStudentRoute ? studentLinks : adminLinks;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Brain className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">EvalAI</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {!isStudentRoute && (
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">Admin</p>
          )}
          {!isStudentRoute && adminLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">Student</p>
          {studentLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">EvalAI</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            {links.slice(0, 4).map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg p-2 transition-colors ${
                    active ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-auto bg-background p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
