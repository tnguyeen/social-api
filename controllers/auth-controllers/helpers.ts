import { z, ZodString } from "zod";

export const usernameSchema = z
  .string()
  .max(12, { message: "Tên đăng nhập không được nhiều hơn 12 kí tự!" })
  .min(6, { message: "Tên đăng nhập không được ít hơn 6 kí tự!" })
  .regex(/^[a-zA-Z0-9.]*$/, {
    message: "Tên đăng nhập chỉ được chứa chữ, số và dấu chấm!",
  });

export const passwordSchema = z
  .string()
  .max(12, { message: "Mật khẩu không được nhiều hơn 12 kí tự!" })
  .min(6, { message: "Mật khẩu không được ít hơn 6 kí tự!" })
  .regex(/^[a-zA-Z0-9]*$/, { message: "Mật khẩu chỉ được chứa chữ và số!" });

export const emailSchema = z.string().email("Nhập chính xác địa chỉ email!");

export const zodCheck = (checkValue: string, schema: ZodString) => {
  const resultCheck = schema.safeParse(checkValue);
  if (!resultCheck.success) {
    const zodError = JSON.parse(resultCheck.error.message);
    return {
      success: false,
      message: zodError[0].message,
    };
  } else {
    return {
      success: true,
      message: "",
    };
  }
};

export const generateOTP = () => {
  const characters = "0123456789";
  let otp = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters.charAt(randomIndex);
  }
  return otp;
};

export const generateNewPassword = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let newPassword = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    newPassword += characters.charAt(randomIndex);
  }
  return newPassword;
};
