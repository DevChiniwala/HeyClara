"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/chat", icon: "chat_bubble", label: "Chat" },
  { href: "/jobs", icon: "work", label: "Jobs" },
  { href: "/channels", icon: "hub", label: "Channels" },
  { href: "/persona", icon: "face", label: "Persona" },
  { href: "/history", icon: "history", label: "History" },
  { href: "/settings", icon: "settings", label: "Settings" },
  { href: "/system", icon: "terminal", label: "System" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest bg-opacity-80 backdrop-blur-xl border-r border-outline-variant flex flex-col p-md z-40">
      <div className="mb-xl px-sm pt-md">
        <Link href="/">
          <h1 className="text-headline-md font-headline-md text-primary tracking-tight">HeyClara</h1>
          <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mt-1">AI Assistant</p>
        </Link>
      </div>

      <ul className="flex-1 space-y-2 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-sm py-2 rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary font-bold border-r-2 border-primary rounded-l-lg"
                    : "text-on-surface-variant font-medium hover:bg-surface-variant/30 hover:text-on-surface hover:border-primary/50"
                )}
              >
                <span className={cn("material-symbols-outlined mr-md", isActive && "fill")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto relative z-10">
        <button className="w-full py-2 mb-md rounded-lg border border-outline-variant text-body-bold font-body-bold text-on-surface hover:bg-surface-variant/30 hover:border-primary/50 hover:text-primary transition-colors">
          Switch to Cloud
        </button>
        <div className="flex items-center px-sm py-2 text-on-surface-variant font-medium">
          <span className="material-symbols-outlined mr-md">lan</span>
          <span className="text-label-caps font-label-caps uppercase tracking-wider">Local Mode</span>
        </div>
      </div>
    </nav>
  );
}
