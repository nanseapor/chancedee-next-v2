import { AuthProvider } from "@/components/auth/auth-provider";
import { ToastProvider } from "@/hooks/use-toast-notification";
import { chancedeeStore } from "@/store/atom-store";
import { Provider } from "jotai/react";
import { Toaster } from "@/components/ui/sonner";

export default function JobsMarketLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={chancedeeStore}>
      <AuthProvider>
        <ToastProvider>
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}
