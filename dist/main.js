"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.all("/", (req, res) => res.status(200).json({ message: "Welcome to DB API 🌸" }));
app.use("/auth", modules_1.authenticationController);
app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ message: "Invalid Application Route" });
});
app.use(middleware_1.globalErrorHandler);
app.listen(3000, () => {
    console.log("Server started on port 3000");
});
