import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import uploadService, {
  UploadProgress,
  UploadResponse,
} from "@/services/uploadService";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  /**
   * Course ID for the upload
   */
  courseId: number;

  /**
   * Optional lesson ID for lesson-specific uploads
   */
  lessonId?: number;

  /**
   * Type of attachment (if any)
   */
  attachType?: "lessonVideo" | "promoVideo" | "thumbnail";

  /**
   * Accept specific file types
   */
  accept?: "video" | "audio" | "image" | "document" | "all";

  /**
   * Maximum file size in MB (optional override)
   */
  maxSizeMB?: number;

  /**
   * Multiple file selection
   */
  multiple?: boolean;

  /**
   * Label for the upload area
   */
  label?: string;

  /**
   * Help text
   */
  helperText?: string;

  /**
   * Callback when upload completes successfully
   */
  onUploadComplete?: (response: UploadResponse) => void;

  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;

  /**
   * Callback when files are selected (before upload)
   */
  onFilesSelected?: (files: File[]) => void;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Show preview for images/videos
   */
  showPreview?: boolean;
}

interface UploadingFile {
  file: File;
  progress: UploadProgress;
  status: "uploading" | "completed" | "error";
  response?: UploadResponse;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  courseId,
  lessonId,
  attachType,
  accept = "all",
  maxSizeMB,
  multiple = false,
  label,
  helperText,
  onUploadComplete,
  onUploadError,
  onFilesSelected,
  className,
  disabled = false,
  showPreview = true,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = uploadService.detectFileType(file);
    switch (type) {
      case "image":
        return <Image className="w-8 h-8 text-blue-500" />;
      case "video":
        return <Video className="w-8 h-8 text-purple-500" />;
      case "audio":
        return <Music className="w-8 h-8 text-green-500" />;
      case "document":
        return <FileText className="w-8 h-8 text-orange-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getAcceptString = () => {
    switch (accept) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "audio":
        return "audio/*";
      case "document":
        return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv";
      default:
        return "*/*";
    }
  };

  const validateFiles = (
    files: File[]
  ): { valid: File[]; invalid: { file: File; error: string }[] } => {
    const valid: File[] = [];
    const invalid: { file: File; error: string }[] = [];

    files.forEach((file) => {
      let fileType: "video" | "audio" | "image" | "document";

      if (accept === "all") {
        fileType = uploadService.detectFileType(file);
      } else {
        fileType = accept;
      }

      const validation = uploadService.validateFile(file, fileType);

      if (validation.valid) {
        valid.push(file);
      } else {
        invalid.push({ file, error: validation.error || "Invalid file" });
      }
    });

    return { valid, invalid };
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (disabled) return;

      const { valid, invalid } = validateFiles(files);

      // Show errors for invalid files
      invalid.forEach(({ file, error }) => {
        onUploadError?.(`${file.name}: ${error}`);
      });

      if (valid.length === 0) return;

      onFilesSelected?.(valid);

      // Start uploads
      const newUploadingFiles: UploadingFile[] = valid.map((file) => ({
        file,
        progress: { loaded: 0, total: file.size, percentage: 0 },
        status: "uploading" as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload each file
      valid.forEach(async (file, index) => {
        try {
          const { data, error } = await uploadService.uploadCourseResource(
            {
              file,
              courseId,
              lessonId,
              attach: attachType,
            },
            (progress) => {
              setUploadingFiles((prev) =>
                prev.map((uf) => (uf.file === file ? { ...uf, progress } : uf))
              );
            }
          );

          if (error) {
            setUploadingFiles((prev) =>
              prev.map((uf) =>
                uf.file === file
                  ? { ...uf, status: "error" as const, error }
                  : uf
              )
            );
            onUploadError?.(error);
          } else if (data) {
            setUploadingFiles((prev) =>
              prev.map((uf) =>
                uf.file === file
                  ? { ...uf, status: "completed" as const, response: data }
                  : uf
              )
            );
            onUploadComplete?.(data);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.file === file
                ? { ...uf, status: "error" as const, error: errorMessage }
                : uf
            )
          );
          onUploadError?.(errorMessage);
        }
      });
    },
    [
      courseId,
      lessonId,
      attachType,
      disabled,
      onUploadComplete,
      onUploadError,
      onFilesSelected,
    ]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const removeUploadingFile = useCallback((file: File) => {
    setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file));
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent
          className="p-6 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <Upload
              className={cn(
                "w-12 h-12 mx-auto",
                dragOver ? "text-primary" : "text-gray-400"
              )}
            />

            <div>
              <p className="text-lg font-medium">
                Drop files here or{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  browse
                </Button>
              </p>
              {helperText && (
                <p className="text-sm text-gray-500 mt-1">{helperText}</p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={getAcceptString()}
              multiple={multiple}
              onChange={handleFileSelect}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(uploadingFile.file)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {uploadingFile.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      {uploadingFile.status === "uploading" && (
                        <Badge variant="secondary">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Uploading...
                        </Badge>
                      )}
                      {uploadingFile.status === "completed" && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                      {uploadingFile.status === "error" && (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadingFile(uploadingFile.file)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    {uploadService.formatFileSize(uploadingFile.file.size)}
                  </p>

                  {uploadingFile.status === "uploading" && (
                    <div className="mt-2">
                      <Progress
                        value={uploadingFile.progress.percentage}
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {uploadingFile.progress.percentage}% of{" "}
                        {uploadService.formatFileSize(
                          uploadingFile.progress.total
                        )}
                      </p>
                    </div>
                  )}

                  {uploadingFile.status === "error" && uploadingFile.error && (
                    <Alert className="mt-2" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {uploadingFile.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadingFile.status === "completed" &&
                    uploadingFile.response &&
                    showPreview && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600">
                          Upload successful! URL: {uploadingFile.response.url}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
