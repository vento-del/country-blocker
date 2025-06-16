import { createRequestHandler } from "@remix-run/node";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from build/client
app.use(express.static(join(__dirname, "build/client")));

// Handle all other requests with Remix
app.all("*", async (req, res, next) => {
  try {
    // Dynamically import the server build
    const build = await import("./build/server/index.js");
    const requestHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    });
    
    return requestHandler(req, res);
  } catch (error) {
    console.error("Error handling request:", error);
    return next(error);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});