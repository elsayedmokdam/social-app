"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_js_1 = require("../config.js");
const initializeDB = async (app, port) => {
    try {
        await mongoose_1.default.connect(config_js_1.DB_URI);
        console.log("Database Connected Successfully ✅");
    }
    catch (error) {
        console.log(`Failed to Connect Database ❌ ${error}`);
        return;
    }
    try {
        app.listen(port, () => console.log(`App listening on port ${port} 🚀`));
    }
    catch (error) {
        console.log(`Failed to Sync Indexes ❌ ${error}`);
    }
};
exports.initializeDB = initializeDB;
