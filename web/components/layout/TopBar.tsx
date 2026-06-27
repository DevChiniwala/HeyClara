"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function TopBar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-surface/80 fixed top-0 right-0 w-[calc(100%-260px)] z-50 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-lg h-16 ml-[260px]">
      <div className="flex-1 flex items-center">
        <div className="relative w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-body-base font-body-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center space-x-md">
        <div className="px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant flex items-center shadow-[0_0_10px_rgba(249,115,22,0.15)]">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_8px_#f97316]" />
          <span className="text-label-caps font-label-caps text-on-surface uppercase">Daemon: Online</span>
        </div>
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">bolt</span>
        </button>
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">account_tree</span>
        </button>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden ml-sm cursor-pointer hover:border-primary transition-colors block"
          >
            <img
              alt="User profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_wxN_uNysvywX3tsB8_4R-P-junXVS-epMdQJ9xjO-DYf8l0YYXCi2wZgHGZ8atYx0c6K_pRUeDsx2KvJgCjC9Eh-5cbVnci8FD4xJiPb7nzXQfu0sogBbifmN5Gg6Bqlk4hpTTP95dwvJvGU7WtpcSk1yN8wr0_q18_EODZS4PZbwo5Bbpwxtwkj1C3JODPVQS4wJwvmoE1idCZlIW_qjvlBQK3OQJKTv7acp5V2PF0Mor1eKYFbP5BL2suYZ9vqBF33tta9Ux4"
            />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-high border border-outline-variant/50 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-outline-variant/30">
                <p className="text-body-bold font-body-bold text-on-surface text-sm">Local User</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Local mode</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-body-base font-body-base text-on-surface-variant hover:bg-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
