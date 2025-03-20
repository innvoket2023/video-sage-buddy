import { z, ZodType } from "zod";

export const signUpSchema = z.object({
  userName: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z0-9.-_]+$/, {
      message: "Only letters, numbers, ., - and _ are allowed",
    }),
  email: z.string().max(254).email(),
  password: z.string().min(8,{message:"Password must contain atleast 8 characters."})
});

