"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/jobs", label: "Jobs" },
  { href: "/profiles", label: "Profiles" },
  { href: "/alerts", label: "Alerts" },
  { href: "/settings/tokens", label: "Settings" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/jobs"
              className="flex items-center px-2 text-xl font-bold text-amber-600"
            >
              GoldMedal Jobs
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname.startsWith(item.href)
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
