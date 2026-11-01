import { ZodType } from "zod";
import { LanguageEnum } from "../enum";

export type ValidationSchemaType = (lang: LanguageEnum) => ZodType;
