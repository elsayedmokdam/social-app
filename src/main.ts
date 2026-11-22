// DNS Problem
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
// ------------------------------------------
import express from "express";
import cors from "cors";
import { authenticationController, userController } from "./modules";
import { globalErrorHandler } from "./middleware";
import { PORT } from "./config";
import { initializeDB } from "./DB/connection.db";
import { cloudService } from "./common/service";
import { promisify } from "node:util"; // Take Promise and Return Promise
import { pipeline } from "node:stream"; // Read and Write Streams

const s3ResponsePipeline = promisify(pipeline);
const app: express.Application = express();

// Database Connection
initializeDB(app, PORT);

// Application Level Middleware
app.use(cors(), express.json());

//------------- Application Routes -------------
// Test Route
app.all(
  "/",
  async (
    req: express.Request,
    res: express.Response,
  ): Promise<express.Response> =>
    res.status(200).json({ message: "Welcome to DB API 🌸" }),
);

// Handle Local File Upload assets
app.use("/assets", express.static("./assets"));

// Get the Key Of the Image From Its Params
app.get(
  "/uploads/*path",
  async (req: express.Request, res: express.Response) => {
    const Key = (req.params.path as string[]).join("/");
    // Get the approach of the image (get or download)
    const {
      download = "true",
      filename = (req.params.path as string[]).pop(),
    } = req.query as {
      download?: "true" | false;
      filename?: string;
    };
    const { Body } = await cloudService.getAsset({ Key });
    // Handle the CROSS Error
    res.set("Cross-Origin-Resourse-Policy", "cross-origin");
    // Download the File
    download &&
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
    return await s3ResponsePipeline(Body as NodeJS.ReadableStream, res);
  },
);

// Authentication Routes
app.use("/auth", authenticationController);
// User Routes
app.use("/user", userController);

// Handle Invalid Routes
app.all("{/*dummy}", (req, res) => {
  res.status(404).json({ message: "Invalid Application Route" });
});

// Global Error Handler
app.use(globalErrorHandler);
