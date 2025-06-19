import { Request, Response } from "express";

const ping = (req: Request, res: Response) => {
  res.send("holla! :>");
};

export const pingController = {
  ping,
};
