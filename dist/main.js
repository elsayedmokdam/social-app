"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
node_dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const connection_db_1 = require("./DB/connection.db");
const service_1 = require("./common/service");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const s3ResponsePipeline = (0, node_util_1.promisify)(node_stream_1.pipeline);
const app = (0, express_1.default)();
(0, connection_db_1.initializeDB)(app, config_1.PORT);
app.use((0, cors_1.default)(), express_1.default.json());
app.all("/", async (req, res) => res.status(200).json({ message: "Welcome to DB API 🌸" }));
app.use("/assets", express_1.default.static("./assets"));
app.get("/uploads/*path", async (req, res) => {
    const Key = req.params.path.join("/");
    const { download = "true", filename = req.params.path.pop(), } = req.query;
    const { Body } = await service_1.cloudService.getAsset({ Key });
    res.set("Cross-Origin-Resourse-Policy", "cross-origin");
    download &&
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return await s3ResponsePipeline(Body, res);
});
app.use("/auth", modules_1.authenticationController);
app.use("/user", modules_1.userController);
app.use("/post", modules_1.postController);
app.use("/posts", modules_1.postController);
app.use("/", modules_1.commentController);
app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ message: "Invalid Application Route" });
});
app.use(middleware_1.globalErrorHandler);
