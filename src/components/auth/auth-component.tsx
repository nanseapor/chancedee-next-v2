"use client";

import { logout } from "@/domains/authentication/services/server/actions/session";
import getUserDataWithToken from "@/domains/authentication/services/server/actions/user-data";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { swrKeys, userDataSWRConfig } from "@/lib/swr-config";
import { initializeBookmarkedBlogsAtom, userAtom } from "@/store/atom-store";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const AuthComponent = ({ mobile }: { mobile?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useSetAtom(userAtom);
  const { user, loading } = useFirebaseAuth();
  const initializeBookmarkedBlogs = useSetAtom(initializeBookmarkedBlogsAtom);
  const [idToken, setIdToken] = useState<string>();

  // Fetch user data from database to get avatarURL
  // Optimized with SWR config to reduce redundant fetches
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
    if (!user) {
      localStorage.setItem("redirect", pathname);
    } else {
      initializeBookmarkedBlogs(user.uid);
      // Get ID token to fetch user data
      user
        .getIdToken()
        .then((token) => {
          setIdToken(token);
        })
        .catch((err) => {
          console.error("Error getting ID token:", err);
        });
    }
  }, [pathname, user]);

  const signOutFirebase = useCallback(async () => {
    try {
      const { success, error } = await logout();
      if (success) {
        await getFirebaseAuth().signOut();
        setUser(null);
        window.location.reload();
      } else {
        console.error("Logout failed:", error);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [setUser]);

  if (mobile) {
    return (
      <nav className="w-full">
        <ul className="space-y-2">
          {user ? (
            <>
              <li>
                <Link
                  href="/profile"
                  className="block py-2 px-4  text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  ส่วนของผู้ใช้งาน {user.displayName || user.email}
                </Link>
              </li>
              <li>
                <button
                  onClick={signOutFirebase}
                  className="w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/auth/sign-in"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-up"
                  className="block py-2 px-4 text-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200"
                >
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    );
  }

  return (
    <>
      {user ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Avatar>
                <AvatarImage
                  src={userData?.avatarURL || user.photoURL || undefined}
                  alt="Chancedee Avatar"
                />
                <AvatarFallback>
                  {user?.displayName?.slice(0, 2) || "N/A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 mt-2 animate-in slide-in-from-top-1 duration-300 bg-white border border-gray-200 shadow-lg"
            sideOffset={5}
          >
            <DropdownMenuItem
              className="px-4 py-2 hover:bg-secondary-50 focus:bg-secondary-50 marker:cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-4 py-2 hover:bg-secondary-50 focus:bg-secondary-50 cursor-pointer"
              onClick={signOutFirebase}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Link
            href="/auth/sign-in"
            className="flex font-light cursor-pointer hover:underline"
          >
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="flex font-light cursor-pointer">
            <Button
              variant="default"
              className="rounded-full transition-all hover:bg-gradient-to-tr hover:from-primary-600 hover:to-primary-400 duration-700 font-light"
            >
              Become Member
            </Button>
          </Link>
        </>
      )}
    </>
  );
};

export default AuthComponent;
