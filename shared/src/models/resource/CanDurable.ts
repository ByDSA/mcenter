import { z } from "zod";

export const canDurableSchema = z.object( {
  start: z.number(),
  end: z.number(),
  duration: z.number().optional(),
} );
type CanDurable = z.infer<typeof canDurableSchema>;

export default CanDurable;