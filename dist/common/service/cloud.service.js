"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config");
const node_crypto_1 = require("node:crypto");
const exception_1 = require("../exception");
const lib_storage_1 = require("@aws-sdk/lib-storage");
class CloudService {
    cloudClient;
    constructor() {
        this.cloudClient = new client_s3_1.S3Client({
            region: config_1.AWS_S3_REGION,
            credentials: {
                accessKeyId: config_1.AWS_S3_ACCESS_KEY_ID,
                secretAccessKey: config_1.AWS_S3_ACCESS_SECRET_KEY,
            },
        });
    }
    generateKey({ file, folder }) {
        return `${config_1.APP_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`;
    }
    async uploadAsset({ file, folder = "general", Bucket = config_1.AWS_S3_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, }) {
        const Key = this.generateKey({ file, folder });
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key,
            ACL,
            Body: file.buffer,
        });
        await this.cloudClient.send(command);
        if (!command.input.Key)
            throw new exception_1.BadRequestException("Failed to upload this asset");
        return command.input.Key;
    }
    async uploadLargeAsset({ file, folder = "general", Bucket = config_1.AWS_S3_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, partSize = 5, }) {
        const upload = new lib_storage_1.Upload({
            client: this.cloudClient,
            params: {
                Key: `${config_1.APP_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}`,
                Bucket,
                ACL,
                Body: file.buffer,
                ContentType: file.mimetype,
            },
            partSize: partSize * 1024 * 1024,
        });
        upload.on("httpUploadProgress", (process) => {
            console.log(`loading...[${(process.loaded / process.total) * 100}%]`);
        });
        return await upload.done();
    }
    async getAsset({ Bucket = config_1.AWS_S3_BUCKET_NAME, Key, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
        });
        return await this.cloudClient.send(command);
    }
    async deleteAsset({ Bucket = config_1.AWS_S3_BUCKET_NAME, Key, }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key,
        });
        return await this.cloudClient.send(command);
    }
    async deleteAssets({ Bucket = config_1.AWS_S3_BUCKET_NAME, Keys, }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys.map((key) => {
                    return { Key: key };
                }),
            },
        });
        return await this.cloudClient.send(command);
    }
    async listFolderDirs({ Bucket = config_1.AWS_S3_BUCKET_NAME, Prefix, }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix: `${config_1.APP_NAME}/${Prefix}`,
        });
        return await this.cloudClient.send(command);
    }
    async deleteFolderByPrefix({ Bucket = config_1.AWS_S3_BUCKET_NAME, Prefix, }) {
        const { Contents } = await this.listFolderDirs({ Bucket, Prefix });
        const Keys = Contents?.map((path) => path.Key);
        return await this.deleteAssets({ Bucket, Keys });
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
