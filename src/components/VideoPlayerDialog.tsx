import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
const VideoPlayerDialog = ({ open, setOpen, videoTitle, videoUrl }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{videoTitle}</DialogTitle>
          {/* <DialogDescription>Add a new video to your library</DialogDescription> */}
        </DialogHeader>

        <div className="space-y-4 py-2">
          <video id="video-preview" controls className="w-full h-96">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
