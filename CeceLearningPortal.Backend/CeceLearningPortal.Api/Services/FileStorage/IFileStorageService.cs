using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CeceLearningPortal.Api.Services
{
    public interface IFileStorageService
    {
        Task<(string storageKey, string publicUrl, long size, string mimeType)> SaveAsync(IFormFile file, string categoryFolder, string? desiredFileName = null);
        Task<bool> DeleteAsync(string storageKey);
        string GetPublicUrl(string storageKey);
    }
}

