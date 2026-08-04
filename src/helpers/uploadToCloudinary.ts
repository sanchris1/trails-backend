import cloudinary from "../config/cloudinary.config.js";

export interface CloudinaryUploadResults {
  secure_url: string;
  public_id: string;
}

export async function uploadToCloudinary(
  file: Express.Multer.File,
): Promise<CloudinaryUploadResults> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "trails",
        format: "webp",
      },
      (error, result) => {
        if (error || !result) {
          console.log(error);
          return reject(new Error("Error uploading image to cloudinary"));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );
    stream.end(file.buffer);
  });
}

export async function deleteImageFromCloudinary(public_id: string) {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.log("Error deleting the image from cloudinary", error);
  }
}
