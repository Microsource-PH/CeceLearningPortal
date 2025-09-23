using System;

namespace CeceLearningPortal.Api.Configurations
{
    public class FileStorageSettings
    {
        // Root path on disk where files are stored (e.g., wwwroot/uploads)
        public string RootPath { get; set; } = "wwwroot/uploads";

        // Public base URL prefix for serving files (e.g., /uploads)
        public string PublicBasePath { get; set; } = "/uploads";

        // Max file size in bytes (default 500MB)
        public long MaxFileSizeBytes { get; set; } = 500L * 1024 * 1024;

        // Allowed MIME types (comma-separated in config) or leave empty to allow common defaults
        public string[] AllowedMimeTypes { get; set; } = new[]
        {
            // Documents
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            // Images
            "image/jpeg",
            "image/png",
            "image/webp",
            // Video
            "video/mp4",
            "video/webm",
            "video/quicktime",
            // Audio
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/aac",
            "audio/ogg",
            "audio/webm"
        };
    }
}
