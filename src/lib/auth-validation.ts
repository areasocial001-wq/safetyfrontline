import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, { message: "Il nome deve contenere almeno 2 caratteri" })
    .max(100, { message: "Il nome non può superare 100 caratteri" }),
  email: z.string()
    .trim()
    .email({ message: "Inserisci un'email valida" })
    .max(255, { message: "L'email non può superare 255 caratteri" }),
  password: z.string()
    .min(8, { message: "La password deve contenere almeno 8 caratteri" })
    .max(72, { message: "La password non può superare 72 caratteri" })
    .regex(/[A-Z]/, { message: "La password deve contenere almeno una lettera maiuscola" })
    .regex(/[a-z]/, { message: "La password deve contenere almeno una lettera minuscola" })
    .regex(/[0-9]/, { message: "La password deve contenere almeno un numero" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

// Schema per registrazione Azienda Cliente
export const companyClientSignUpSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, { message: "Il nome deve contenere almeno 2 caratteri" })
    .max(100, { message: "Il nome non può superare 100 caratteri" }),
  email: z.string()
    .trim()
    .email({ message: "Inserisci un'email valida" })
    .max(255, { message: "L'email non può superare 255 caratteri" }),
  password: z.string()
    .min(8, { message: "La password deve contenere almeno 8 caratteri" })
    .max(72, { message: "La password non può superare 72 caratteri" })
    .regex(/[A-Z]/, { message: "La password deve contenere almeno una lettera maiuscola" })
    .regex(/[a-z]/, { message: "La password deve contenere almeno una lettera minuscola" })
    .regex(/[0-9]/, { message: "La password deve contenere almeno un numero" }),
  confirmPassword: z.string(),
  companyName: z.string()
    .trim()
    .min(2, { message: "Il nome dell'azienda deve contenere almeno 2 caratteri" })
    .max(200, { message: "Il nome dell'azienda non può superare 200 caratteri" }),
  phone: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]{8,20}$/, { message: "Inserisci un numero di telefono valido" })
    .optional()
    .or(z.literal('')),
  vatNumber: z.string()
    .trim()
    .regex(/^\d{11}$/, { message: "La Partita IVA deve contenere 11 cifre" })
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

// Schema per registrazione Dipendente
export const employeeSignUpSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, { message: "Il nome deve contenere almeno 2 caratteri" })
    .max(100, { message: "Il nome non può superare 100 caratteri" }),
  email: z.string()
    .trim()
    .email({ message: "Inserisci un'email valida" })
    .max(255, { message: "L'email non può superare 255 caratteri" }),
  password: z.string()
    .min(8, { message: "La password deve contenere almeno 8 caratteri" })
    .max(72, { message: "La password non può superare 72 caratteri" })
    .regex(/[A-Z]/, { message: "La password deve contenere almeno una lettera maiuscola" })
    .regex(/[a-z]/, { message: "La password deve contenere almeno una lettera minuscola" })
    .regex(/[0-9]/, { message: "La password deve contenere almeno un numero" }),
  confirmPassword: z.string(),
  companyName: z.string()
    .trim()
    .min(2, { message: "Il nome dell'azienda deve contenere almeno 2 caratteri" })
    .max(200, { message: "Il nome dell'azienda non può superare 200 caratteri" }),
  employeeId: z.string()
    .trim()
    .min(2, { message: "Il codice dipendente deve contenere almeno 2 caratteri" })
    .max(50, { message: "Il codice dipendente non può superare 50 caratteri" })
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Inserisci un'email valida" })
    .max(255, { message: "L'email non può superare 255 caratteri" }),
  password: z.string()
    .min(1, { message: "Inserisci la password" })
    .max(72, { message: "La password non può superare 72 caratteri" }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type CompanyClientSignUpFormData = z.infer<typeof companyClientSignUpSchema>;
export type EmployeeSignUpFormData = z.infer<typeof employeeSignUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
