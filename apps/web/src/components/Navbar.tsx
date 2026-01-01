"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  LayoutDashboard, 
  LogOut, 
  UserPlus, 
  BrainCircuit,
  LogIn,
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simplified check for demo purposes - in a real app, 
  // you'd use a global auth state or a dedicated 'me' endpoint
  useEffect(() => {
  const checkAuth = () => {
    // 1. Check if we are currently on an authentication page
    const authPages = ['/login', '/register'];
    const isAuthPage = authPages.includes(pathname);

    // 2. If we're on an auth page, we should NEVER show "Logout" 
    // regardless of what the cookies say.
    if (isAuthPage) {
      setIsLoggedIn(false);
      return;
    }

    // 3. Otherwise, check for session cookies normally
    const hasToken = document.cookie.includes("token") || document.cookie.includes("session");
    setIsLoggedIn(hasToken);
  };
  
  checkAuth();
}, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout` ||
          "http://localhost:5000/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
      setIsLoggedIn(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    ...(isLoggedIn ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
  ];

  const authLinks = !isLoggedIn ? [
    { href: "/login", label: "Login", icon: LogIn },
    { href: "/register", label: "Register", icon: UserPlus },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 group relative z-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 transition-colors group-hover:bg-violet-500/20">
              <BrainCircuit className="h-5 w-5 text-violet-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-violet-200">
              Study Companion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <div className="flex items-center gap-1 pr-4 border-r border-white/10 mr-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : ""}`} />
                    <span>{link.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-lg bg-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href 
                      ? "bg-violet-600 text-white" 
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              ))}

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-neutral-400 hover:text-white relative z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/10 bg-neutral-950 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-2">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    pathname === link.href 
                      ? "bg-violet-600/20 text-violet-400 border border-violet-500/20" 
                      : "text-neutral-400 hover:bg-white/5"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {isLoggedIn && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}