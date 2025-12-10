import { LoadingSpinner } from "@/components/common/loading-spinner";
import { FabChat } from "@/components/fab-chat";
import { Footer2 } from "@/components/features/footer-2";
import { getCategories } from "@/lib/categories";
import { chancedeeStore } from "@/store/atom-store";
import { Provider } from "jotai/react";
import { default as dynamicImport } from "next/dynamic";
const Navbar = dynamicImport(() => import("@/components/navigation/navbar"), {
  loading: () => <LoadingSpinner />,
});
const AuthProvider = dynamicImport(
  () =>
    import("@/components/auth/auth-provider").then((mod) => ({
      default: mod.AuthProvider,
    })),
  {
    ssr: false,
  },
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories({
    filter: {
      status: {
        _eq: "published",
      },
    },
  });
  return (
    <>
      <Navbar categories={categories} />
      <Provider store={chancedeeStore}>
        <AuthProvider>{children}</AuthProvider>
      </Provider>
      <Footer2 />
      <FabChat />
    </>
  );
}
