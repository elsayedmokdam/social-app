import express from "express";
import { authenticationController } from "./modules";
import { globalErrorHandler } from "./middleware";
const app: express.Application = express();

// Application Level Middleware
app.use(express.json())

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
app.use(globalErrorHandler)

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
