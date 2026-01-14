'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAtomValue, useSetAtom } from 'jotai';
import useSWR from 'swr';
import { sessionStateAtom } from '@/store/jobsmarket/global-atoms';
import { userAtom } from '@/store/atom-store';
import { UserMenu } from '@/components/jobsmarket/global/UserMenu';
import { getUserDataWithToken } from '@/domains/authentication/services/server/actions/user-data';
import { logout } from '@/domains/authentication/services/server/actions/session';
import { getFirebaseAuth } from '@/lib/firebase';
import { swrKeys, userDataSWRConfig } from '@/lib/swr-config';

export function PublicHeader() {
  const sessionState = useAtomValue(sessionStateAtom);
  const currentUser = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const isAuthenticated = sessionState === 'authenticated' && currentUser;

  const [idToken, setIdToken] = useState<string>();

  // Fetch user data from database to get avatarURL
  const { data: userData } = useSWR(
    swrKeys.userData(idToken),
    async () => {
      if (idToken) {
        return await getUserDataWithToken(idToken);
      }
      return null;
    },
    userDataSWRConfig,
  );

  useEffect(() => {
    if (currentUser) {
      currentUser
        .getIdToken()
        .then((token) => {
          setIdToken(token);
        })
        .catch((err) => {
          console.error('Error getting ID token:', err);
        });
    }
  }, [currentUser]);

  const handleLogout = useCallback(async () => {
    try {
      const { success, error } = await logout();
      if (success) {
        await getFirebaseAuth().signOut();
        setUser(null);
        window.location.href = '/jobsmarket/auth/login';
      } else {
        console.error('Logout failed:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [setUser]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/brand/horizontal-logo.svg"
            alt="ChanceDee"
            width={140}
            height={32}
            priority
            className="h-8 w-auto"
          />
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
            <AuthenticatedMenu
              userName={getUserName(userData, currentUser)}
              avatarUrl={userData?.avatarURL || currentUser?.photoURL || undefined}
              onLogout={handleLogout}
            />
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

/**
 * Get user display name from system user data, falling back to Firebase user
 */
function getUserName(
  userData: { firstnameTH?: string; lastnameTH?: string; nicknameTH?: string } | null | undefined,
  firebaseUser: { displayName?: string | null } | null
): string {
  // Try system user data first
  if (userData?.firstnameTH) {
    const firstName = userData.firstnameTH;
    const lastName = userData.lastnameTH || '';
    return `${firstName} ${lastName}`.trim();
  }

  // Fallback to Firebase display name
  if (firebaseUser?.displayName) {
    return firebaseUser.displayName;
  }

  // Default fallback
  return 'บัญชีของฉัน';
}

interface AuthenticatedMenuProps {
  userName: string;
  avatarUrl?: string;
  onLogout: () => void;
}

function AuthenticatedMenu({ userName, avatarUrl, onLogout }: AuthenticatedMenuProps) {
  return (
    <UserMenu
      userName={userName}
      avatarUrl={avatarUrl}
      profileHref="/jobsmarket/candidates/dashboard"
      settingsHref="/jobsmarket/auth/settings"
      onLogout={onLogout}
    />
  );
}
