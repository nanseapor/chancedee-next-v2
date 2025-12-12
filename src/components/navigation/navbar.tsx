"use client";

import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/lib/categories";
import { JOBS_HOST } from "@/config/hosts";
import dynamic from "next/dynamic";
import Link from "next/link";
import ChancedeeLogo from "../media/chancedee-logo";
import SearchDialog from "./search-dialog";
const AuthComponent = dynamic(() => import("../auth/auth-component"), {
  ssr: false,
});
const NavbarLink = dynamic(() => import("./navbar-link"), { ssr: false });

export default function Navbar({ categories }: { categories: Category[] }) {
  return (
    <header className="flex items-center justify-between py-2 bg-white shadow-lg z-50 relative">
      <div className="px-4 2xl:px-[12rem]  flex items-center justify-around w-full">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ChancedeeLogo />
          </Link>
          <nav className="pl-2 hidden xl:grid w-full auto-cols-fr grid-flow-col gap-1.5 items-stretch">
            {categories &&
              categories?.length > 0 &&
              categories
                ?.sort((a, b) => {
                  if (a.id && b.id) {
                    return a.id - b.id;
                  }
                  return 0;
                })
                .map((category, index) => (
                  <NavbarLink key={category.id} category={category} />
                ))}
            <Link
              href="/ai-assistant"
              className="flex items-center justify-center text-center rounded-lg hover:bg-primary-100 p-2 px-4 transition-colors font-light duration-500 h-full"
            >
              Chancedee mentor - AI
            </Link>
            <Link
              href={JOBS_HOST}
              className="flex items-center justify-center text-center rounded-lg hover:bg-primary-100 p-2 px-4 transition-colors font-light duration-500 h-full"
            >
              Job Market
            </Link>
          </nav>
        </div>
        <SearchDialog />
        <div className="hidden xl:flex justify-around shrink-0 items-center gap-4 ml-6">
          <AuthComponent />
        </div>
        <MobileNavbar>
          <div className="rounded-b-lg bg-background px-4 text-foreground shadow-xl py-8 border-t">
            <nav className="flex flex-col">
              {categories &&
                categories?.length > 0 &&
                categories
                  ?.sort((a, b) => {
                    if (a.id && b.id) {
                      return a.id - b.id;
                    }
                    return 0;
                  })
                  .map((category, index) => (
                    <NavbarLink key={category.id} category={category} mobile />
                  ))}
              <Link
                href="/ai-assistant"
                className="flex cursor-pointer pl-4 py-2 items-center text-lg text-secondary-900 transition-colors hover:text-foreground"
              >
                Chancedee mentor - AI
                <br />
              </Link>
              <Link
                href={JOBS_HOST}
                className="flex cursor-pointer pl-4 py-2 items-center text-lg text-secondary-900 transition-colors hover:text-foreground"
              >
                Job Market
                <br />
              </Link>
            </nav>
            <Separator orientation="horizontal" className="my-4" />
            <AuthComponent mobile />
          </div>
        </MobileNavbar>
      </div>
    </header>
  );
}
