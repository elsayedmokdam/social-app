import { z } from "zod";
import { signupSchema } from "../../schemas";

// Use z.infer to extract the type from the schema and define the SignUpDTO type
export type SignUpDTO = z.infer<ReturnType<typeof signupSchema>>;
