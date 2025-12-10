"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Toast {
  id: number;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface ToastContextType {
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const newToast: Toast = { id: Date.now(), message, type };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-0 right-0 left-0 z-50 flex flex-col items-center">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  removeToast: (id: number) => void;
}> = ({ toast, removeToast }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => removeToast(toast.id), 300); // Match this with transition duration
    }, 5000); // Adjust this value to control how long the toast stays visible
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const getToastColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div
      className={`m-2 p-4 px-8 md:px-[8rem] 2xl:px-[16rem] ${getToastColor()} w-screen text-white rounded shadow-lg transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex justify-between items-center">
        <p>{toast.message}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
