import { educationHistory } from "./candidate.types";

export type PersonaData = {
  careerLevel?: string;
  birthdate?: number;
  gender?: string;
  educationLevel?: educationHistory[];
  isConsent?: boolean;
};

export type PersonaCheckResult = {
  isComplete: boolean;
  missingFields: string[];
  currentData?: PersonaData;
};
