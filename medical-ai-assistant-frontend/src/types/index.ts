/**
 * ================================================================
 * Τύποι δεδομένων (TypeScript interfaces) για όλη την εφαρμογή
 * ================================================================
 *
 * Αυτό το αρχείο περιέχει όλους τους τύπου TypeScript ώστε:
 * - Να μη χρησιμοποιούμε "any" που χάνει τον έλεγχο τύπων
 * - Να τεκμηριώνεται η δομή των δεδομένων
 * - Να πιάνουμε λάθη compile-time αντί για runtime
 */

/** Χρήστης (γιατρός/διαχειριστής) */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
}

/** Ασθενής */
export interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
  amka: string;
  age: number;
  gender: string;
  telephone: string;
  doctorId: number;
}

/** Αποτέλεσμα διάγνωσης από το AI (Gemini) */
export interface Diagnosis {
  diagnosis: string;
  confidence: string;
  analysis?: string;
  recommendations?: string[];
  red_flags?: string[];
}

/** Μία εγγραφή συνομιλίας (ερώτηση-απάντηση) */
export interface ConversationEntry {
  question: string;
  answer: string;
  type: string;
}

/** Περιστατικό ιατρικής περίθαλψης */
export interface MedicalCase {
  id: number;
  patientId: number;
  patient?: Patient;
  symptoms: string;
  diagnosis: string;
  type: string;
  date: string;
  conversation?: string;
  tags?: string;
}

/** Απάντηση από το backend μετά από login */
export interface LoginResponse {
  token: string;
  user: User;
}
