import { Request, Response } from "express";
import http, { IncomingMessage } from "http";

const requestFromServer = (req: Request, res: Response) => {
  const hostname = "server";
  const port = 3001;

  const options = {
    hostname,
    port,
    path: req.originalUrl.replace(/^\/api/, ""),
    method: req.method,
    headers: req.headers,
  };

  const proxy = http.request(options, (proxyRes: IncomingMessage) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxy, { end: true });

  proxy.on("error", (e: Error) => {
    res.status(500).send({ error: "Proxy error", details: e.message });
  });
};

export { requestFromServer };
