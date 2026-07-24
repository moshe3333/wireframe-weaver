import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import API_BASE, { getAuthData, clearAuthData } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('student');
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const data = getAuthData();
    if (data.token) {
      setUser({ uid: data.uid, displayName: data.fullName });
      setRole(data.role || 'student');
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    clearAuthData();
    setUser(null);
    navigate('/');
  };

  // Simplified and consolidated role-based redirection
  const getDashboardPath = (userRole: string) => {
    const roleLower = userRole?.toLowerCase();
    if (roleLower === 'instructor') return '/instructor-dashboard';
    if (roleLower === 'admin') return '/dashboard';
    return '/student-dashboard';
  };

  const dashboardPath = getDashboardPath(role);

  const handleDashboardClick = async () => {
    const auth = getAuthData();
    const fallbackPath = getDashboardPath(auth.role || role || 'student');

    if (!auth.uid) {
      navigate(fallbackPath);
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/users/${auth.uid}`);
      if (!resp.ok) {
        navigate(fallbackPath);
        return;
      }

      const data = await resp.json();
      const accountType = (data.accountType || auth.role || role || 'student').toLowerCase();
      setRole(accountType);
      localStorage.setItem('auth_role', accountType);
      navigate(getDashboardPath(accountType));
    } catch {
      navigate(fallbackPath);
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">EvalAI</span>
        </Link>

        {isHome && (
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'How it Works', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </div>
        )}

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  aria-label="User menu"
                  title={user.displayName || "User menu"}
                  className="rounded-full border border-border scale-95 hover:scale-100 transition-transform"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDashboardClick}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(role === 'student' ? '/student-profile' : '/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-border bg-background px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <button onClick={handleDashboardClick} className="text-left text-sm font-medium text-foreground">Dashboard</button>
                <button onClick={handleSignOut} className="text-left text-sm font-medium text-destructive">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-sm font-medium text-muted-foreground">Sign In</Link>
                <Link to="/register" className="text-sm font-medium text-foreground">Get Started</Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

