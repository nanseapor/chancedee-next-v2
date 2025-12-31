'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAtomValue } from 'jotai';
import { sessionStateAtom } from '@/store/jobsmarket/global-atoms';
import { userAtom } from '@/store/atom-store';

export function PublicHeader() {
  const sessionState = useAtomValue(sessionStateAtom);
  const currentUser = useAtomValue(userAtom);
  const isAuthenticated = sessionState === 'authenticated' && currentUser;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">ChanceDee</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/jobsmarket/jobs"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            หางาน
          </Link>
          <Link
            href="/jobsmarket/companies"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            บริษัท
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            <AuthenticatedMenu user={currentUser} />
          ) : (
            <GuestButtons />
          )}
        </div>
      </div>
    </header>
  );
}

function GuestButtons() {
  return (
    <>
      <Link href="/jobsmarket/auth/login">
        <Button variant="ghost" size="sm">
          เข้าสู่ระบบ
        </Button>
      </Link>
      <Link href="/jobsmarket/auth/register">
        <Button size="sm" className="hidden sm:inline-flex">
          ลงทะเบียน
        </Button>
      </Link>
    </>
  );
}

function AuthenticatedMenu({ user }: { user: { displayName?: string | null } | null }) {
  // Simple authenticated state - can enhance later
  return (
    <Link href="/jobsmarket/candidates/dashboard">
      <Button variant="ghost" size="sm">
        {user?.displayName || 'บัญชีของฉัน'}
      </Button>
    </Link>
  );
}
