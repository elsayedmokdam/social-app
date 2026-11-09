import { Request } from "express";

export const issuer = (req: Request) => `${req.protocol}://${req.host}`;
