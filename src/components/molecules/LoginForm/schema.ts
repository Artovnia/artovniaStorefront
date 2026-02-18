import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .nonempty("Proszę podać adres email")
    .email("Nieprawidłowy adres email"),
  password: z.string().nonempty("Proszę podać hasło"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;