using System.IO;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CeceLearningPortal.Api.Configurations;

namespace CeceLearningPortal.Api.Services
{
    public class FolderFileStorageService : IFileStorageService
    {
        private readonly FileStorageSettings _settings;
        private readonly ILogger<FolderFileStorageService> _logger;

        public FolderFileStorageService(IOptions<FileStorageSettings> settings, ILogger<FolderFileStorageService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<(string storageKey, string publicUrl, long size, string mimeType)> SaveAsync(IFormFile file, string categoryFolder, string? desiredFileName = null)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is required");
            }

            if (file.Length > _settings.MaxFileSizeBytes)
            {
                throw new InvalidOperationException($"File exceeds max size {_settings.MaxFileSizeBytes} bytes");
            }

            if (_settings.AllowedMimeTypes != null && _settings.AllowedMimeTypes.Length > 0)
            {
                var isAllowed = Array.Exists(_settings.AllowedMimeTypes, m => string.Equals(m, file.ContentType, StringComparison.OrdinalIgnoreCase));
                if (!isAllowed)
                {
                    throw new InvalidOperationException($"MIME type not allowed: {file.ContentType}");
                }
            }

            var rootPath = _settings.RootPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            var category = string.IsNullOrWhiteSpace(categoryFolder) ? "misc" : categoryFolder.Trim('/','\\');
            var dateFolder = DateTime.UtcNow.ToString("yyyy/MM");
            var targetDir = Path.Combine(rootPath, category, dateFolder);
            Directory.CreateDirectory(targetDir);

            var ext = Path.GetExtension(file.FileName);
            var baseName = !string.IsNullOrWhiteSpace(desiredFileName)
                ? Path.GetFileNameWithoutExtension(desiredFileName)
                : Path.GetFileNameWithoutExtension(file.FileName);

            var safeBase = ToSafeFileName(baseName);
            var unique = Guid.NewGuid().ToString("N").Substring(0, 8);
            var finalFileName = $"{safeBase}-{unique}{ext}";
            var fullPath = Path.Combine(targetDir, finalFileName);

            using (var stream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream);
            }

            // Compute storage key relative to root
            var storageKey = Path.Combine(category, dateFolder, finalFileName).Replace('\\','/');
            var publicUrl = GetPublicUrl(storageKey);
            return (storageKey, publicUrl, file.Length, file.ContentType);
        }

        public Task<bool> DeleteAsync(string storageKey)
        {
            try
            {
                var rootPath = _settings.RootPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                var localPath = Path.Combine(rootPath, storageKey.Replace('/', Path.DirectorySeparatorChar));
                if (File.Exists(localPath))
                {
                    File.Delete(localPath);
                    return Task.FromResult(true);
                }
                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {StorageKey}", storageKey);
                return Task.FromResult(false);
            }
        }

        public string GetPublicUrl(string storageKey)
        {
            var prefix = _settings.PublicBasePath.TrimEnd('/');
            var key = storageKey.Replace('\\','/').TrimStart('/');
            return $"{prefix}/{key}";
        }

        private static string ToSafeFileName(string name)
        {
            var invalid = Path.GetInvalidFileNameChars();
            foreach (var ch in invalid)
            {
                name = name.Replace(ch, '-');
            }
            // Basic slugging
            name = name.Trim().ToLowerInvariant();
            name = System.Text.RegularExpressions.Regex.Replace(name, @"[^a-z0-9-_]+", "-");
            name = System.Text.RegularExpressions.Regex.Replace(name, @"-+", "-").Trim('-');
            return string.IsNullOrWhiteSpace(name) ? "file" : name;
        }
    }
}

