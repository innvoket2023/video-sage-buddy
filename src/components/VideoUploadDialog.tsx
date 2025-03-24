import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileVideo, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { uploadToCloudinary, sendToBackend } from "@/api/videoUploadApi";

const VideoUploadDialog = ({ open, setOpen }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      // First, upload to Cloudinary
      const videoTitle = title.trim() || selectedFile.name;
      const cloudinaryResponse = await uploadToCloudinary(
        selectedFile,
        videoTitle,
        description,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 50) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      );

      setUploadProgress(60);

      // Get the video URL and ID from Cloudinary
      const videoUrl = cloudinaryResponse.secure_url;
      const publicId = cloudinaryResponse.public_id;

      console.log("Cloudinary upload successful:", videoUrl);

      // Send the video information to our backend for processing
      const backendResponse = await sendToBackend(
        videoUrl,
        publicId,
        videoTitle,
        description,
        (progressEvent) => {
          const percentCompleted =
            60 + Math.round((progressEvent.loaded * 10) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      );

      setUploadProgress(95);
      console.log("Backend processing result:", backendResponse);

      // If backend response includes a transcript
      if (backendResponse.transcript) {
        console.log("Video transcript:", backendResponse.transcript);
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        setTitle("");
        setDescription("");
        setOpen(false);
      }, 500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to upload video"
      );
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (uploading) return;
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setError("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>Add a new video to your library</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("video-upload").click()}
            >
              <FileVideo className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium">
                Drag and drop your video here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports MP4, MOV, AVI up to 2GB
              </p>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4 overflow-hidden">
              <div className="flex max-w-[460px] items-center p-4 bg-gray-50 rounded-lg overflow-hidden">
                <FileVideo className="h-8 w-8 text-blue-500 mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate overflow-hidden">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    className="max-w-[460px]"
                    placeholder="Enter video title or leave blank to use filename"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1 max-w-[460px]">
                    {title.trim()
                      ? `Using custom title: "${title}"`
                      : `Using filename: "${selectedFile.name}"`}
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a description"
                    className="resize-none h-20 max-w-[460px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between max-w-[460px]">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploadDialog;
