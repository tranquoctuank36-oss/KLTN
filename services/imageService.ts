import api from "./api";

export interface UploadImageResponse {
  id: string;
  publicUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function uploadImage(file: File, ownerType: string = "review"): Promise<UploadImageResponse> {
  try {
    // Step 1: Get presigned URL from backend
    const response = await api.post("/images/presigned-url", {
      contentType: file.type,
      ownerType: ownerType,
    });

    const { imageId, putUrl, publicUrl } = response.data.data;

    // Step 2: Upload file to presigned URL
    await fetch(putUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    // Step 3: Return image information
    return {
      id: imageId,
      publicUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error: any) {
    console.error("Upload image failed:", error.response || error.message);
    throw error;
  }
}
