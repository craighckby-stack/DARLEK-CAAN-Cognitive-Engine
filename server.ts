import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import next from "next";

const dev: boolean = process.env.NODE_ENV !== "production";
const hostname: string = "0.0.0.0";
const port: number = Number.parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(
      async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        try {
          const parsedUrl = parse(req.url ?? "", true);
          await handle(req, res, parsedUrl);
        } catch (err: unknown) {
          console.error(`[EMG-CORE] Error handling request for URL: ${req.url}`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end("Internal Server Error");
          }
        }
      }
    )
      .once("error", (err: Error) => {
        console.error("[EMG-CORE] Fatal server error encountered:", err);
        process.exit(1);
      })
      .listen(port, hostname, () => {
        console.log(
          `> [EMG-CORE] Sovereign Neural Node ready on http://${hostname}:${port} [${
            dev ? "development" : "production"
          }]`
        );
      });
  })
  .catch((err: unknown) => {
    console.error("[EMG-CORE] Failed to prepare Next.js application instance:", err);
    process.exit(1);
  });