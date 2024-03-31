import { Request, Response } from "express";

const lookUpBook = (req: Request, res: Response) => {
  res.send("Get Books");
};

export { lookUpBook };
