import { Request, Response } from "express";

let responses: Response[] = [];

const sendBookEvent = (data: any) => {
  responses.forEach((response) =>
    response.write(`data: ${JSON.stringify(data)}\n\n`),
  );
};

const getBookEvents = (request: Request, response: Response) => {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");

  responses.push(response);

  request.on("close", () => {
    response.end();
  });
};

export { getBookEvents, sendBookEvent };
