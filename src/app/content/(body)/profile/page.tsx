"use client";

import getCandidateDataWithToken from "@/domains/candidates/services/server/actions/candidate-data";
import getUserDataWithToken from "@/domains/authentication/services/server/actions/user-data";
import ProfilePageSkeleton from "@/components/user/profile-page-skeleton";
import { UserProfileTabs } from "@/components/user/userprofile-tabs";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { profileDataSWRConfig, swrKeys } from "@/lib/swr-config";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetchUserData = async (idToken?: string | null) => {
  if (idToken) {
    try {
      const result = await getUserDataWithToken(idToken);
      if (result) {
        return result;
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  }
  return undefined;
};

const fetchCandidateData = async (idToken?: string | null) => {
  if (idToken) {
    try {
      const result = await getCandidateDataWithToken(idToken);
      if (result) {
        return result;
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  }
  return undefined;
};

export default function BookmarksPage() {
  const router = useRouter(); // Import the useRouter hook
  const pathname = usePathname(); // Import the usePathname hook
  const { user, loading } = useFirebaseAuth();
  const [idToken, setIdToken] = useState<string>();
  const {
    data,
    isLoading: userLoading,
    error: userError,
  } = useSWR(
    swrKeys.userProfile(idToken),
    async () => {
      // Check user and register first, then check candidate data
      // If have user but no candidate, will try register candidate data
      // Concurrently fetch both user and candidate data will create Mutex error
      const userData = await fetchUserData(idToken);
      const candidateData = await fetchCandidateData(idToken);
      return { userInformation: userData, candidateInformation: candidateData };
    },
    profileDataSWRConfig,
  );

  useEffect(() => {
    if (!loading) {
      if (!user) {
        localStorage.setItem("redirect", pathname);
        router.replace("/auth/sign-in");
      } else {
        user
          .getIdToken()
          .then((token) => {
            setIdToken(token);
          })
          .catch((err) => {
            console.error("Get user token error", err);
          });
      }
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return null; // This will prevent any flash of content before redirect
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-lg md:text-3xl font-bold">
          {data?.userInformation?.firstnameTH ||
            user?.displayName ||
            user?.email}
          's Profile
        </h1>
      </div>
      {
        <UserProfileTabs
          userInformation={data?.userInformation}
          candidateInformation={data?.candidateInformation}
          userLoading={userLoading}
        />
      }
    </div>
  );
}
