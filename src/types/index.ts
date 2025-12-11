import type { MasterJobApplicationStatuses } from "@/constants/application";
import { JSX } from "react";

export type SidebarLink = {
  icon: JSX.Element;
  imgURL?: string;
  route: string;
  label: string;
};

// Define specific types for category arrays
interface CategoryComponent {
  id: string;
  name: string;
  type?: string;
}

interface CategoryItem {
  id: string;
  label: string;
  value?: string;
}

interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  completed: number;
  count: number;
  components: CategoryComponent[];
  items: CategoryItem[];
  subcategories: Subcategory[];
}

export type backendResponse = {
  code: string;
  message: string;
  data?: unknown;
};
export interface IModalProps {
  labelModal?: string;
}

export interface IAlertModalProps<T> {
  label?: string;
  disabled?: boolean;
  actions: {
    role?: string;
    data: T;
    type: string;
  };
  onClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<string>;
}

export type Icon = {
  svgClassName?: string;
};
export interface ISelectVariant {
  variant?: "line" | "default" | "auth" | "";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
}

export type businessHours = {
  id: string;
  mondayStatus: "Opened" | "Closed";
  tuesdayStatus: "Opened" | "Closed";
  wednesdayStatus: "Opened" | "Closed";
  thursdayStatus: "Opened" | "Closed";
  fridayStatus: "Opened" | "Closed";
  saturdayStatus: "Opened" | "Closed";
  sundayStatus: "Opened" | "Closed";
  mondayOpening: string;
  tuesdayOpening: string;
  wednesdayOpening: string;
  thursdayOpening: string;
  fridayOpening: string;
  saturdayOpening: string;
  sundayOpening: string;
  mondayClosing: string;
  tuesdayClosing: string;
  wednesdayClosing: string;
  thursdayClosing: string;
  fridayClosing: string;
  saturdayClosing: string;
  sundayClosing: string;
  createdAt: string;
  updatedAt: string;
};

export type bookings = {
  id: string;
  type: "Interview" | "On boarding";
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: MasterJobApplicationStatuses;
  createdAt: string;
  updatedAt: string;
};

export type Booking = bookings;

export type BusinessHours = businessHours;
