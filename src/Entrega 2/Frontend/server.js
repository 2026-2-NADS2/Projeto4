const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const rootDirectory = __dirname;
const port = process.env.PORT || 5173;
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = http.createServer((request, response) => {
  const requestPath = new URL(request.url, `http://${request.headers.host}`).pathname;
  const relativePath = requestPath === "/" ? "index.html" : decodeURIComponent(requestPath).replace(/^\/+/, "");
  const filePath = path.resolve(rootDirectory, relativePath);

  if (!filePath.startsWith(rootDirectory)) {
    response.writeHead(403);
    response.end("Acesso não permitido.");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.code === "ENOENT" ? "Arquivo não encontrado." : "Erro ao carregar o arquivo.");
      return;
    }
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
  });
});

server.listen(port, () => console.log(`KFKA disponível em http://localhost:${port}`));
