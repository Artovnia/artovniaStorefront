import { z } from "zod";

export const registerFormSchema = z
  .object({
    firstName: z.string().nonempty("Proszę podać imię"),
    lastName: z.string().nonempty("Proszę podać nazwisko"),
    email: z
      .string()
      .nonempty("Proszę podać adres email")
      .email("Nieprawidłowy adres email"),
    confirmPassword: z.string().nonempty("Proszę potwierdzić hasło"),
    password: z
      .string()
      .nonempty("Proszę podać hasło")
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
        message:
          "Hasło musi zawierać co najmniej jedną wielką literę i jeden znak specjalny",
      }),
    phone: z
      .string()
      .min(6, "Proszę podać numer telefonu")
      .regex(/^\+?\d+$/, {
        message: "Numer telefonu może zawierać tylko cyfry",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są takie same",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;