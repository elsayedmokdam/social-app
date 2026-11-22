"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMulterUpload = exports.processFields = exports.processFiles = exports.processFileS3 = exports.processFile = exports.localFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const promises_1 = require("node:fs/promises");
const file_type_1 = require("file-type");
const exception_1 = require("../../exception");
const node_os_1 = require("node:os");
const service_1 = require("../../service");
const localFileUpload = ({ maxFileSize = 5, }) => {
    const storage = maxFileSize >= 5
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination(req, file, callback) {
                callback(null, (0, node_os_1.tmpdir)());
            },
            filename(req, file, callback) {
                callback(null, (0, node_crypto_1.randomUUID)() + file.originalname);
            },
        });
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: maxFileSize * 1024 * 1024 },
    });
};
exports.localFileUpload = localFileUpload;
const validateFile = async ({ file, validation, }) => {
    const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
    if (!validation.includes(result?.mime)) {
        if (file.path)
            await (0, promises_1.unlink)(file.path);
        throw new exception_1.BadRequestException("Invalid File Format");
    }
    return result;
};
const processFile = async ({ customPath = "general", file, validation, }) => {
    if (file.path)
        file.buffer = await (0, promises_1.readFile)(file.path);
    const result = await validateFile({ file, validation });
    await (0, promises_1.mkdir)((0, node_path_1.resolve)(`./assets/${customPath}`), { recursive: true });
    const filePath = `./assets/${customPath}/${(0, node_crypto_1.randomUUID)()}.${result?.ext}`;
    await (0, promises_1.writeFile)(filePath, file.buffer);
    if (file.path)
        await (0, promises_1.unlink)(file.path);
    file.path = filePath;
    return file;
};
exports.processFile = processFile;
const processFileS3 = async ({ customPath = "general", file, validation, }) => {
    await validateFile({ file, validation });
    const Key = await service_1.cloudService.uploadAsset({
        file,
        folder: `assets/${customPath}/${(0, node_crypto_1.randomUUID)()}`,
    });
    if (file.path)
        await (0, promises_1.unlink)(file.path);
    file.key = Key;
    return file;
};
exports.processFileS3 = processFileS3;
const processFiles = async ({ customPath = "general", files, validation, }) => {
    await Promise.all(files.map(async (file) => validateFile({ file, validation })));
    const assets = await Promise.all(files.map((file) => (0, exports.processFileS3)({ customPath, file, validation })));
    return assets.map((file) => file);
};
exports.processFiles = processFiles;
const processFields = async ({ customPath = "general", fields, validation, }) => {
    await Promise.all(Object.entries(fields).map(async ([key, files]) => {
        await Promise.all(files.map(async (file) => validateFile({ file, validation })));
    }));
    const assets = await Promise.all(Object.entries(fields).map(async ([key, files]) => {
        const processedFiles = await Promise.all(files.map((file) => (0, exports.processFileS3)({ customPath, file, validation })));
        return [key, processedFiles];
    }));
    return Object.fromEntries(assets);
};
exports.processFields = processFields;
const processMulterUpload = async ({ req, customPath, validation, }) => {
    if (req.file) {
        const file = await (0, exports.processFileS3)({
            customPath,
            file: req.file,
            validation,
        });
        req.file = file;
    }
    else if (Array.isArray(req.files)) {
        const files = await (0, exports.processFiles)({
            customPath,
            files: req.files,
            validation,
        });
        req.files = files;
    }
    else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
        const files = await (0, exports.processFields)({
            customPath,
            fields: req.files,
            validation,
        });
        req.files = files;
    }
};
exports.processMulterUpload = processMulterUpload;
