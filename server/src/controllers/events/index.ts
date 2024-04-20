import { Request, Response } from "express";
import { BookEvent } from "./event.types";

let responses: Response[] = [];

const sendBookEvent = (event: BookEvent) => {
  responses.forEach((response) =>
    response.write(`data: ${JSON.stringify(event)}\n\n`),
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
