import { Request, Response } from "express";

const helloWorld = (req: Request, res: Response) => {
  res.send("Hello, World!");
};

export { helloWorld };
