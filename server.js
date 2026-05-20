import { createServer } from "http";
import { readFile } from "fs";
import { resolve, extname } from "path";

const root = __dirname;
const port = 8765;
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  const requestedFile = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const filePath = resolve(root, requestedFile);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });

    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`Organizador rodando em http://${host}:${port}`);
});