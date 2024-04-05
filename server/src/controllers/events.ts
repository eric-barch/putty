import { Request, Response } from "express";

let response: Response;

const sendEvent = (data: any) => {
  if (!response) {
    console.log("!response");
    return;
  }

  response.write(`data: ${JSON.stringify(data)}\n\n`);
};

const getEvents = (request: Request, response: Response) => {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");

  response = response;

  request.on("close", () => {
    response.end();
  });
};

export { getEvents, sendEvent };
