import z from "zod";

export * from "./role";

export * from "./user";

export * from "./jwt";

export const googleStateSchema = z.object( {
  redirect: z.string(),
} );

export type GoogleState = z.infer<typeof googleStateSchema>;
