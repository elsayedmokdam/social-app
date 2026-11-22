import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  APP_NAME,
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_ACCESS_SECRET_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_S3_REGION,
} from "../../config";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exception";
import { IFile } from "../types";
import { Progress, Upload } from "@aws-sdk/lib-storage";

export class CloudService {
  private cloudClient: S3Client;
  constructor() {
    this.cloudClient = new S3Client({
      region: AWS_S3_REGION,
      credentials: {
        accessKeyId: AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: AWS_S3_ACCESS_SECRET_KEY,
      },
    });
  }

  generateKey({ file, folder }: { file: IFile; folder: string }) {
    return `${APP_NAME}/${folder}/${randomUUID()}_${file.originalname}`;
  }

  // --------- Upload Assets ----------
  // Upload Assets Will Be Handled On the Multer Using the Same Function (uploadAsset)
  async uploadAsset({
    file,
    folder = "general",
    Bucket = AWS_S3_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
  }: {
    file: IFile;
    folder?: string;
    Bucket?: string;
    ACL?: ObjectCannedACL;
  }): Promise<string> {
    const Key = this.generateKey({ file, folder });
    const command = new PutObjectCommand({
      Bucket,
      Key,
      ACL,
      Body: file.buffer,
    });
    await this.cloudClient.send(command);
    if (!command.input.Key)
      throw new BadRequestException("Failed to upload this asset");
    return command.input.Key;
  }

  // --------- Upload Large Assets ----------
  async uploadLargeAsset({
    file,
    folder = "general",
    Bucket = AWS_S3_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    partSize = 5,
  }: {
    file: IFile;
    folder?: string;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    partSize?: number;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const upload = new Upload({
      client: this.cloudClient,
      params: {
        Key: `${APP_NAME}/${folder}/${randomUUID()}`,
        Bucket,
        ACL,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
      partSize: partSize * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (process: Progress) => {
      console.log(
        `loading...[${((process.loaded as number) / (process.total as number)) * 100}%]`,
      );
    });
    return await upload.done();
  }

  // --------- Get Assets ----------
  async getAsset({
    Bucket = AWS_S3_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });
    return await this.cloudClient.send(command);
  }

  // --------- Delete Asset ----------
  async deleteAsset({
    Bucket = AWS_S3_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });
    return await this.cloudClient.send(command);
  }

  // --------- Delete Assets ----------
  async deleteAssets({
    Bucket = AWS_S3_BUCKET_NAME,
    Keys,
  }: {
    Bucket?: string;
    Keys: string[];
  }): Promise<DeleteObjectsCommandOutput> {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: Keys.map((key) => {
          return { Key: key };
        }),
      },
    });
    return await this.cloudClient.send(command);
  }

  // ------- List Folder Dirs --------
  async listFolderDirs({
    Bucket = AWS_S3_BUCKET_NAME,
    Prefix,
  }: {
    Bucket?: string;
    Prefix: string;
  }): Promise<ListObjectsV2CommandOutput> {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${APP_NAME}/${Prefix}`,
    });
    return await this.cloudClient.send(command);
  }

  // ---- Delete Folder By Prefix -----
  async deleteFolderByPrefix({
    Bucket = AWS_S3_BUCKET_NAME,
    Prefix,
  }: {
    Bucket?: string;
    Prefix: string;
  }): Promise<DeleteObjectsCommandOutput> {
    const { Contents } = await this.listFolderDirs({ Bucket, Prefix });
    const Keys = Contents?.map((path) => path.Key) as string[];
    return await this.deleteAssets({ Bucket, Keys });
  }
}

export const cloudService = new CloudService();
