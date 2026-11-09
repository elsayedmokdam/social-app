// DNS Problem
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
// ------------------------------------------
import express from "express";
import cors from "cors";
import { authenticationController } from "./modules";
import { globalErrorHandler } from "./middleware";
import { PORT } from "./config";
import { initializeDB } from "./DB/connection.db";
const app: express.Application = express();

// Database Connection
initializeDB(app, PORT);

// Application Level Middleware
app.use(cors(), express.json());

//------------- Application Routes -------------
// Test Route
app.all("/", (req, res) =>
  res.status(200).json({ message: "Welcome to DB API 🌸" }),
);

// Authentication Routes
app.use("/auth", authenticationController);

// Handle Invalid Routes
app.all("{/*dummy}", (req, res) => {
  res.status(404).json({ message: "Invalid Application Route" });
});

// Global Error Handler
app.use(globalErrorHandler);
