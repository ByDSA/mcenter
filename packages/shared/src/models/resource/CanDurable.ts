import { z } from "zod";

export const canDurableSchema = z.object( {
  start: z.number(),
  end: z.number(),
} );
type CanDurable = z.infer<typeof canDurableSchema>;

export default CanDurable;