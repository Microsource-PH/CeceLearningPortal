using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;
using CeceLearningPortal.Api.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace CeceLearningPortal.Api.Controllers
{
    [ApiController]
    [Route("api/uploads")]
    [Authorize]
    public class UploadsController : ControllerBase
    {
        private readonly IFileStorageService _storage;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UploadsController> _logger;

        public UploadsController(IFileStorageService storage, ApplicationDbContext context, ILogger<UploadsController> logger)
        {
            _storage = storage;
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        [RequestSizeLimit(600L * 1024 * 1024)]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] Guid? resourceId)
        {
            if (file == null) return BadRequest(new { message = "File is required" });

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var category = resourceId.HasValue ? "resources" : "misc";
            var (storageKey, publicUrl, size, mimeType) = await _storage.SaveAsync(file, category);

            var entity = new FileAsset
            {
                Id = Guid.NewGuid(),
                StorageKey = storageKey,
                OriginalFilename = file.FileName,
                MimeType = mimeType,
                Size = size,
                Checksum = string.Empty,
                CdnUrl = publicUrl,
                OwnerUserId = userId,
                ResourceId = resourceId,
                UploadStatus = "completed",
                ErrorMessage = string.Empty,
                MetadataJson = "{}",
                CreatedAt = DateTime.UtcNow
            };
            _context.FileAssets.Add(entity);
            await _context.SaveChangesAsync();

            var dto = new FileAssetDto
            {
                Id = entity.Id,
                StorageKey = entity.StorageKey,
                OriginalFilename = entity.OriginalFilename,
                MimeType = entity.MimeType,
                Size = entity.Size,
                CdnUrl = entity.CdnUrl,
                UploadStatus = entity.UploadStatus,
                CreatedAt = entity.CreatedAt
            };
            return Ok(dto);
        }

        [HttpPost("course-resource")]
        [Authorize]
        [RequestSizeLimit(600L * 1024 * 1024)]
        public async Task<IActionResult> UploadCourseResource(
            [FromForm] IFormFile file,
            [FromForm] int courseId,
            [FromForm] int? lessonId,
            [FromForm] string? attach // optional: lessonVideo | promoVideo | thumbnail | none
        )
        {
            if (file == null) return BadRequest(new { message = "File is required" });

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            var course = await _context.Courses.Include(c => c.Modules).ThenInclude(m => m.Lessons).FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null) return NotFound(new { message = "Course not found" });
            if (!isAdmin && course.InstructorId != userId)
            {
                return Forbid();
            }

            // Enforce document size limit (25MB) for document-like MIME types
            var mime = file.ContentType?.ToLowerInvariant() ?? string.Empty;
            bool isVideo = mime.StartsWith("video/");
            bool isAudio = mime.StartsWith("audio/");
            bool isImage = mime.StartsWith("image/");
            bool isDocument = !isVideo && !isAudio && !isImage; // treat all others as docs (pdf/word/etc.)

            if (isDocument && file.Length > (25L * 1024 * 1024))
            {
                return BadRequest(new { message = "Document files are limited to 25MB" });
            }

            var category = lessonId.HasValue
                ? $"courses/{courseId}/lessons/{lessonId.Value}"
                : $"courses/{courseId}";

            var (storageKey, publicUrl, size, mimeType) = await _storage.SaveAsync(file, category);

            // Optionally attach to model fields where supported
            if (!string.IsNullOrWhiteSpace(attach))
            {
                switch (attach)
                {
                    case "lessonVideo":
                        if (!lessonId.HasValue)
                            return BadRequest(new { message = "lessonId is required for lessonVideo attachment" });
                        if (!isVideo && !isAudio)
                            return BadRequest(new { message = "Only video/audio can be attached as a lesson video" });
                        var lesson = course.Modules.SelectMany(m => m.Lessons).FirstOrDefault(l => l.Id == lessonId.Value);
                        if (lesson == null) return NotFound(new { message = "Lesson not found" });
                        lesson.VideoUrl = publicUrl;
                        lesson.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        break;
                    case "promoVideo":
                        if (!isVideo && !isAudio)
                            return BadRequest(new { message = "Only video/audio can be attached as a promo video" });
                        course.PromoVideoUrl = publicUrl;
                        course.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        break;
                    case "thumbnail":
                        if (!isImage)
                            return BadRequest(new { message = "Only images can be attached as thumbnail" });
                        course.ThumbnailUrl = publicUrl;
                        course.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        break;
                    default:
                        // no direct attachment, just upload & return URL
                        break;
                }
            }

            return Ok(new
            {
                url = publicUrl,
                storageKey,
                size,
                mimeType,
                courseId,
                lessonId
            });
        }
    }
}
