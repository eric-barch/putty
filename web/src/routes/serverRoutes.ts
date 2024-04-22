import { Request, Response, Router } from "express";
import http, { IncomingMessage } from "http";
import { env } from "process";

const serverRoutes = Router();

serverRoutes.use("/", (req: Request, res: Response) => {
  const hostname = env.SERVER_HOST;
  const port = env.SERVER_PORT;

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
});

export { serverRoutes };
