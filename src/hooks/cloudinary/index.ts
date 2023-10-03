import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import { API_KEY, API_SECRET, CLOUD_NAME } from "../../config";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export const useUploadImage = async (filepath: UploadedFile) =>
  await cloudinary.uploader.upload(filepath.tempFilePath, {
    folder: "store",
  });

export const useUpdateImage = async (
  filepath: UploadedFile,
  public_id: string
) =>
  await cloudinary.uploader.upload(filepath.tempFilePath, {
    public_id,
    overwrite: true,
  });

export const useDeleteImage = async (publicId: string) =>
  await cloudinary.uploader.destroy(publicId);

export const useDeleteImages = async (publicIds: string[]) =>
  await cloudinary.api.delete_resources(publicIds);
