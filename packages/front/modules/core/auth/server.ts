import { cookies } from "next/headers";
import { AppPayload, UserPayload } from "./models";

export const getUser = async (): Promise<UserPayload | null> =>{
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token)
    return null;

  try {
    const payload: AppPayload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8"),
    );

    if (payload.exp && payload.exp * 1000 < Date.now())
      return null;

    return payload.user;
  } catch (error) {
    console.error("Error parsing JWT token:", error);

    return null;
  }
};
