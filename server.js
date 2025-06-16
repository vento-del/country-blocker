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
    console.log(`Handling request: ${req.method} ${req.url}`);
    
    // Check if build file exists
    const fs = await import("fs");
    const path = "./build/server/index.js";
    
    if (!fs.existsSync(path)) {
      console.error("Server build file does not exist:", path);
      return res.status(500).send("Server build file not found. Check build process.");
    }
    
    console.log("Importing server build...");
    const build = await import("./build/server/index.js");
    console.log("Server build imported successfully");
    
    const requestHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    });
    
    return requestHandler(req, res);
  } catch (error) {
    console.error("Detailed error handling request:", {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
    
    // Send detailed error in development
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({
        error: error.message,
        stack: error.stack,
        url: req.url
      });
    }
    
    return next(error);
  }
});

const port = process.env.PORT || 3000;

// Check build directories on startup
const fs = await import("fs");
console.log("=== Startup diagnostics ===");
console.log("Current directory:", process.cwd());
console.log("Build directory exists:", fs.existsSync("./build"));
console.log("Build/client exists:", fs.existsSync("./build/client"));
console.log("Build/server exists:", fs.existsSync("./build/server"));
console.log("Server index.js exists:", fs.existsSync("./build/server/index.js"));

if (fs.existsSync("./build")) {
  console.log("Build directory contents:", fs.readdirSync("./build"));
}
if (fs.existsSync("./build/server")) {
  console.log("Build/server contents:", fs.readdirSync("./build/server"));
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});