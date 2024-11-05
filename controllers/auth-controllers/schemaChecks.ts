import { Response } from "express";
import { z, ZodString } from "zod";

export const usernameSchema = z
  .string()
  .max(12, { message: "Must be 12 or fewer characters long" })
  .min(6, { message: "Must be 6 or fewer characters long" })
  // .refine((s) => !s.includes(" "), "No Spaces!");
  .regex(/^[a-zA-Z0-9.]*$/, { message: "ngu" });

export const zodCheck = (
  username: string,
  schema: ZodString,
) => {
  const resultCheck = schema.safeParse(username);
  if (!resultCheck.success) {
    const zodError = JSON.parse(resultCheck.error.message);
    return {
      success: false,
      message: zodError[0].message,
    }
  } else {
    return {
      success:true,
      message:''
    }
  }
};
