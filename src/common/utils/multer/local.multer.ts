import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../../exception";
import { Request } from "express";
import { tmpdir } from "node:os";
import { IFile } from "../../types";
import { cloudService } from "../../service";

export const localFileUpload = ({
  maxFileSize = 5,
}: {
  maxFileSize?: number;
}) => {
  const storage =
    maxFileSize >= 5
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination(req, file, callback) {
            callback(null, tmpdir());
          },
          filename(req, file, callback) {
            callback(null, randomUUID() + file.originalname);
          },
        });

  // fileFilter always runs before storage even if it comes after storage
  return multer({
    // fileFilter,
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};

const validateFile = async ({
  file,
  validation,
}: {
  file: IFile;
  validation: string[];
}) => {
  const result = await fileTypeFromBuffer(file.buffer);
  if (!validation.includes(result?.mime as string)) {
    if (file.path) await unlink(file.path);
    throw new BadRequestException("Invalid File Format");
  }
  return result;
};

// Handle File
export const processFile = async ({
  customPath = "general",
  file,
  validation,
}: {
  customPath?: string;
  file: IFile;
  validation: string[];
}): Promise<IFile> => {
  // Handle DisckStorage Approach (Convert the Path to Buffer Using readFile)
  if (file.path) file.buffer = await readFile(file.path);
  // Validate File
  const result = await validateFile({ file, validation });
  // Create folder
  await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
  // Create Unique Path Name
  const filePath = `./assets/${customPath}/${randomUUID()}.${result?.ext}`;
  // Write File
  await writeFile(filePath, file.buffer);
  // Remove the File From the Temp if Using DesckStorage Approach
  if (file.path) await unlink(file.path);
  // Update File
  file.path = filePath;
  return file;
};

// Apply S3 Tech
export const processFileS3 = async ({
  customPath = "general",
  file,
  validation,
}: {
  customPath?: string;
  file: IFile;
  validation: string[];
}): Promise<IFile> => {
  // Validate File
  await validateFile({ file, validation });
  // Upload File to S3
  // const { Key } = await cloudService.uploadLargeAsset({
  const Key = await cloudService.uploadAsset({
    file,
    folder: `assets/${customPath}/${randomUUID()}`,
  });
  // Remove the File From the Temp if Using DesckStorage Approach
  if (file.path) await unlink(file.path);
  // Attach S3 Key
  file.key = Key!;
  return file;
};

// Handle Files
export const processFiles = async ({
  customPath = "general",
  files,
  validation,
}: {
  customPath?: string;
  files: IFile[];
  validation: string[];
}): Promise<IFile[]> => {
  // Validate Files Before Processing
  await Promise.all(
    files.map(async (file) => validateFile({ file, validation })),
  );

  // Process Files
  const assets = await Promise.all(
    // files.map((file) => processFile({ customPath, file, validation })),
    files.map((file) => processFileS3({ customPath, file, validation })),
  );
  return assets.map((file) => file);
};

// Handle Fields
export const processFields = async ({
  customPath = "general",
  fields,
  validation,
}: {
  customPath?: string;
  fields: Record<string, IFile[]>;
  validation: string[];
}) => {
  // Validate Files Before Processing
  await Promise.all(
    Object.entries(fields).map(async ([key, files]) => {
      await Promise.all(
        files.map(async (file) => validateFile({ file, validation })),
      );
    }),
  );
  // Process Files
  const assets = await Promise.all(
    Object.entries(fields).map(async ([key, files]) => {
      const processedFiles = await Promise.all(
        // files.map((file) => processFile({ customPath, file, validation })),
        files.map((file) => processFileS3({ customPath, file, validation })),
      );
      return [key, processedFiles];
    }),
  );
  return Object.fromEntries(assets);
};

export const processMulterUpload = async ({
  req,
  customPath,
  validation,
}: {
  req: Request;
  customPath: string;
  validation: string[];
}) => {
  // Case 1: One File Upload.
  if (req.file) {
    // const file = await processFile({
    const file = await processFileS3({
      customPath,
      file: req.file,
      validation,
    });
    req.file = file;

    // Case 2: Multiple File Uploads (Array)
  } else if (Array.isArray(req.files)) {
    const files = await processFiles({
      customPath,
      files: req.files,
      validation,
    });
    req.files = files;

    // Case 3: Upload Fields (More than Object)
  } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
    const files = await processFields({
      customPath,
      fields: req.files,
      validation,
    });
    req.files = files;
  }
};
