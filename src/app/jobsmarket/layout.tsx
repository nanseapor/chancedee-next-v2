import { AuthProvider } from "@/components/auth/auth-provider";
import { chancedeeStore } from "@/store/atom-store";
import { Provider } from "jotai/react";

export default function JobsMarketLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={chancedeeStore}>
      <AuthProvider>
        <main className="min-h-screen">{children}</main>
      </AuthProvider>
    </Provider>
  );
}
