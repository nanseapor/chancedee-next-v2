'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAtomValue, useSetAtom } from 'jotai';
import useSWR from 'swr';
import { sessionStateAtom, dashboardUrlAtom } from '@/store/jobsmarket/global-atoms';
import { userAtom } from '@/store/atom-store';
import { User, Settings, LogOut } from 'lucide-react';
import { UserMenu } from '@/components/jobsmarket/global/UserMenu';
import { getUserDataWithToken } from '@/domains/authentication/services/server/actions/user-data';
import { logout } from '@/domains/authentication/services/server/actions/session';
import { getFirebaseAuth } from '@/lib/firebase';
import { swrKeys, userDataSWRConfig } from '@/lib/swr-config';
import ChancedeeLogo from '@/components/media/chancedee-logo';
import { MobileNavbar } from '@/components/layout/mobile-navbar';

export function PublicHeader() {
  const sessionState = useAtomValue(sessionStateAtom);
  const currentUser = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const dashboardUrl = useAtomValue(dashboardUrlAtom);
  const setDashboardUrl = useSetAtom(dashboardUrlAtom);
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

  // Set dashboard URL when authenticated but atom is still null
  // (happens on direct page access outside CandidateShell/CompanyShell)
  useEffect(() => {
    if (isAuthenticated && currentUser && !dashboardUrl) {
      setDashboardUrl(`/candidates/${currentUser.uid}`);
    }
  }, [isAuthenticated, currentUser, dashboardUrl, setDashboardUrl]);

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

  const navLinkClass = "flex items-center justify-center text-center rounded-lg hover:bg-primary-100 p-2 px-4 transition-colors font-light duration-500 h-full";

  const navLinks = (
    <>
      {isAuthenticated && dashboardUrl && (
        <Link href={dashboardUrl} className={navLinkClass}>
          แดชบอร์ด
        </Link>
      )}
      <Link href="/jobs" className={navLinkClass}>
        หางาน
      </Link>
      <Link href="/companies" className={navLinkClass}>
        บริษัท
      </Link>
    </>
  );

  const authSection = isAuthenticated && currentUser ? (
    <AuthenticatedMenu
      userId={currentUser.uid}
      userName={getUserName(userData, currentUser)}
      avatarUrl={userData?.avatarURL || currentUser?.photoURL || undefined}
      onLogout={handleLogout}
    />
  ) : (
    <GuestButtons />
  );

  return (
    <header className="flex items-center justify-between py-2 bg-white shadow-lg z-50 relative">
      <div className="px-4 2xl:px-[12rem] flex items-center justify-around w-full">
        <div className="flex w-full items-center justify-center">
          {/* Logo */}
          <Link href={process.env.NEXT_PUBLIC_CONTENT_HOST || '/'} className="flex items-center gap-3 shrink-0">
            <ChancedeeLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="pl-2 hidden xl:flex items-center gap-1.5 mx-auto">
            {navLinks}
          </nav>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden xl:flex justify-around shrink-0 items-center gap-4 ml-6">
          {authSection}
        </div>

        {/* Mobile Menu */}
        <MobileNavbar>
          <div className="rounded-b-lg bg-background px-4 text-foreground shadow-xl py-8 border-t">
            <nav className="flex flex-col">
              {isAuthenticated && dashboardUrl && (
                <Link
                  href={dashboardUrl}
                  className="flex cursor-pointer pl-4 py-2 items-center text-lg text-secondary-900 transition-colors hover:text-foreground"
                >
                  แดชบอร์ด
                </Link>
              )}
              <Link
                href="/jobs"
                className="flex cursor-pointer pl-4 py-2 items-center text-lg text-secondary-900 transition-colors hover:text-foreground"
              >
                หางาน
              </Link>
              <Link
                href="/companies"
                className="flex cursor-pointer pl-4 py-2 items-center text-lg text-secondary-900 transition-colors hover:text-foreground"
              >
                บริษัท
              </Link>
            </nav>
            <Separator orientation="horizontal" className="my-4" />
            {isAuthenticated && currentUser ? (
              <MobileAuthMenu
                userId={currentUser.uid}
                userName={getUserName(userData, currentUser)}
                avatarUrl={userData?.avatarURL || currentUser?.photoURL || undefined}
                onLogout={handleLogout}
              />
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full justify-start">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full">
                    ลงทะเบียน
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </MobileNavbar>
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
        <Button size="sm">
          ลงทะเบียน
        </Button>
      </Link>
    </>
  );
}

/**
 * Get user display name for header - uses FIRST NAME ONLY to handle long Thai names
 */
function getUserName(
  userData: { firstnameTH?: string; firstnameEN?: string; nicknameTH?: string } | null | undefined,
  firebaseUser: { displayName?: string | null } | null
): string {
  if (userData?.firstnameTH) {
    return userData.firstnameTH;
  }
  if (userData?.firstnameEN) {
    return userData.firstnameEN;
  }
  if (firebaseUser?.displayName) {
    const firstName = firebaseUser.displayName.split(' ')[0];
    return firstName || firebaseUser.displayName;
  }
  return 'บัญชีของฉัน';
}

interface AuthenticatedMenuProps {
  userId: string;
  userName: string;
  avatarUrl?: string;
  onLogout: () => void;
}

function MobileAuthMenu({ userId, userName, avatarUrl, onLogout }: AuthenticatedMenuProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0]?.[0] && parts[parts.length - 1]?.[0]) {
      return `${parts[0][0]}${parts[parts.length - 1]![0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 py-2 pl-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-secondary-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{getInitials(userName)}</span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-900">{userName}</span>
      </div>
      <Link
        href={`/candidates/${userId}`}
        className="flex cursor-pointer pl-4 py-2 items-center gap-3 text-lg text-secondary-900 transition-colors hover:text-foreground"
      >
        <User className="w-4 h-4" />
        โปรไฟล์
      </Link>
      <Link
        href="/auth/settings"
        className="flex cursor-pointer pl-4 py-2 items-center gap-3 text-lg text-secondary-900 transition-colors hover:text-foreground"
      >
        <Settings className="w-4 h-4" />
        การตั้งค่า
      </Link>
      <button
        onClick={onLogout}
        className="flex cursor-pointer pl-4 py-2 items-center gap-3 text-lg text-red-600 transition-colors hover:text-red-800"
      >
        <LogOut className="w-4 h-4" />
        ออกจากระบบ
      </button>
    </div>
  );
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
