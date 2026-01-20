import z from "zod";

export namespace MusicUserListsCrudDtos {
  export namespace MoveOne {
    export const bodySchema = z.object( {
      entryId: z.string(),
      newIndex: z.number()
        .min(0)
        .int(),
    } );
    export type Body = z.infer<typeof bodySchema>;
  }
}
