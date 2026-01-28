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
        window.location.href = '/auth/login';
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
            href="/jobs"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            หางาน
          </Link>
          <Link
            href="/companies"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            บริษัท
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated && currentUser ? (
            <AuthenticatedMenu
              userId={currentUser.uid}
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
      <Link href="/auth/login">
        <Button variant="ghost" size="sm">
          เข้าสู่ระบบ
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button size="sm" className="hidden sm:inline-flex">
          ลงทะเบียน
        </Button>
      </Link>
    </>
  );
}

/**
 * Get user display name for header - uses FIRST NAME ONLY to handle long Thai names
 * Thai names can be very long (e.g., "Suthida Bajrasudhabimalalakshana" = 226px)
 * First name only reduces this significantly (e.g., "Suthida" = 49px)
 */
function getUserName(
  userData: { firstnameTH?: string; firstnameEN?: string; nicknameTH?: string } | null | undefined,
  firebaseUser: { displayName?: string | null } | null
): string {
  // Priority 1: Thai first name only (most common case)
  if (userData?.firstnameTH) {
    return userData.firstnameTH;
  }

  // Priority 2: English first name
  if (userData?.firstnameEN) {
    return userData.firstnameEN;
  }

  // Priority 3: Firebase display name - extract first name only
  if (firebaseUser?.displayName) {
    const firstName = firebaseUser.displayName.split(' ')[0];
    return firstName || firebaseUser.displayName;
  }

  // Default fallback
  return 'บัญชีของฉัน';
}

interface AuthenticatedMenuProps {
  userId: string;
  userName: string;
  avatarUrl?: string;
  onLogout: () => void;
}

function AuthenticatedMenu({ userId, userName, avatarUrl, onLogout }: AuthenticatedMenuProps) {
  return (
    <UserMenu
      userName={userName}
      avatarUrl={avatarUrl}
      profileHref={`/candidates/${userId}`}
      settingsHref="/auth/settings"
      onLogout={onLogout}
    />
  );
}
