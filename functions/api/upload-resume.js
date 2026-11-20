import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';

export async function onRequestOptions({ request }) {
  return handleOptions(request);
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const headers = getCorsHeaders(origin);

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return errorResponse("Content-Type must be multipart/form-data", "INVALID_CONTENT_TYPE", 400, headers);
    }

    const formData = await request.formData();
    const file = formData.get("resume") || formData.get("file");

    if (!file || typeof file === "string") {
      return errorResponse("No resume file uploaded", "FILE_REQUIRED", 400, headers);
    }

    // Validate file size (10 MB maximum)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return errorResponse("File size exceeds 10MB limit", "FILE_TOO_LARGE", 400, headers);
    }

    // Validate extension
    const fileName = file.name || "resume.pdf";
    const extension = fileName.split(".").pop().toLowerCase();
    const validExtensions = ["pdf", "doc", "docx", "txt", "rtf"];
    if (!validExtensions.includes(extension)) {
      return errorResponse("Invalid file type. Allowed: PDF, DOC, DOCX, RTF, TXT", "INVALID_EXTENSION", 400, headers);
    }

    const sanitizedBase = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniquePath = `${Date.now()}-${sanitizedBase}`;

    let publicUrl = "";

    // Upload to Supabase Storage if configured
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from("resumes")
          .upload(uniquePath, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: true
          });

        if (uploadError) {
          console.warn("Supabase storage upload failed, falling back to CDN mock URL:", uploadError.message);
          publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/resumes/${uniquePath}`;
        } else {
          const { data: { publicUrl: resolvedUrl } } = supabase
            .storage
            .from("resumes")
            .getPublicUrl(uniquePath);
          publicUrl = resolvedUrl;
        }
      } catch (storageErr) {
        console.warn("Storage client error:", storageErr);
        publicUrl = `https://cdn.axim.us.com/resumes/${uniquePath}`;
      }
    } else {
      // Offline / Development fallback
      publicUrl = `https://cdn.axim.us.com/resumes/${uniquePath}`;
    }

    return successResponse({
      resumeUrl: publicUrl,
      resumeName: fileName,
      fileSize: file.size,
      mimeType: file.type
    }, 200, headers);

  } catch (error) {
    console.error("Resume upload error:", error);
    return errorResponse(error.message, "UPLOAD_ERROR", 500, headers);
  }
}
