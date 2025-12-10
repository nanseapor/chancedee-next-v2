"use client";
import { useState } from "react";

import type { userDataProps } from "@/types/auth.types";
import type { candidateDataProps } from "@/types/candidate.types";
import dynamic from "next/dynamic";
import PasswordSettings from "../auth/password-settings";
import { BookmarkTabs } from "../content/bookmark-tabs";
import { default as ProfileEditorSkeleton } from "./profile-editor-skeleton";
import UserNotFound from "./user-not-found";
const ProfileEditor = dynamic(() => import("./profile-editor"), {
  loading: () => <ProfileEditorSkeleton />,
});

type tabType = "profile" | "bookmarks" | "settings";

const UserProfileTabs = ({
  userInformation,
  candidateInformation,
  userLoading,
}: {
  userInformation?: userDataProps;
  candidateInformation?: candidateDataProps;
  userLoading: boolean;
}) => {
  // const { data, isLoading } = useSWR(user?.uid, fetchingBlogs);
  const [activeTab, setActiveTab] = useState<tabType>("bookmarks");

  return (
    <>
      <div className="flex flex-col">
        <div className="flex space-x-4 mb-4">
          <button
            disabled={userLoading}
            onClick={() => setActiveTab("bookmarks")}
            className={`px-4 py-2  rounded-full ${activeTab === "bookmarks" ? "bg-primary text-primary-foreground" : "bg-primary-200"}`}
          >
            Bookmarks
          </button>
          <button
            disabled={userLoading}
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2  rounded-full ${activeTab === "profile" ? "bg-primary text-primary-foreground" : "bg-primary-200"}`}
          >
            Profile
          </button>
          <button
            disabled={userLoading}
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2  rounded-full ${activeTab === "settings" ? "bg-primary text-primary-foreground" : "bg-primary-200"}`}
          >
            Settings
          </button>
        </div>

        {activeTab === "bookmarks" && <BookmarkTabs />}
        {activeTab === "profile" &&
          (userLoading ? (
            <ProfileEditorSkeleton />
          ) : userInformation && candidateInformation ? (
            <ProfileEditor
              userContext={userInformation}
              candidateContext={candidateInformation}
            />
          ) : (
            <UserNotFound />
          ))}
        {activeTab === "settings" &&
          (userLoading ? (
            <h2 className="text-lg font-semibold text-gray-700">Loading...</h2>
          ) : userInformation ? (
            <PasswordSettings userContext={userInformation} />
          ) : (
            <UserNotFound />
          ))}
      </div>
    </>
  );
};

export { UserProfileTabs };
