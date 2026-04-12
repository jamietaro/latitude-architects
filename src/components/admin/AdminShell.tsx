"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { label: "Homepage", href: "/admin/homepage" },
  { label: "Projects", href: "/admin/projects" },
  { label: "News", href: "/admin/news" },
  { label: "Team", href: "/admin/team" },
  { label: "Practice", href: "/admin/practice" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminShell({
  children,
  email,
}: {
  children: ReactNode;
  email: string;
}) {
  const pathname = usePathname();

  async function handleSignOut() {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <div className="admin-section flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-[220px] h-screen bg-[#18181b] flex flex-col z-50">
        <div className="p-6">
          <span
            className="text-white lowercase"
            style={{
              fontSize: "13px",
              fontWeight: 300,
              letterSpacing: "0.05em",
            }}
          >
            latitude
          </span>
        </div>

        <nav className="flex-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 px-6 text-sm transition-colors ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-[#888] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#2a2a2e]">
          <p className="text-[#888] text-xs truncate mb-2">{email}</p>
          <button
            onClick={handleSignOut}
            className="text-[#888] text-xs hover:text-white transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-[220px] flex-1">{children}</main>
    </div>
  );
}
