import { Request, Response } from "express";

const getEvents = (request: Request, response: Response) => {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");

  const sendEvent = (data: any) => {
    response.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const intervalId = setInterval(() => {
    const updateMessage = {
      action: "update",
      timestamp: new Date().toISOString(),
    };
    sendEvent(updateMessage);
  }, 5000);

  request.on("close", () => {
    clearInterval(intervalId);
    response.end();
  });
};

export { getEvents };
