import * as React from "react";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ZoomableImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Drop-in replacement for <img> that opens the photo in a full-screen
 * lightbox when clicked. Escape, the X button, or clicking anywhere closes it.
 */
export function ZoomableImage({ className, alt = "", onClick, ...props }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLImageElement>) => {
    // Photos inside article links should zoom, not navigate
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
    setOpen(true);
  };

  return (
    <>
      <img
        {...props}
        alt={alt}
        className={cn("cursor-zoom-in", className)}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            onClick={() => setOpen(false)}
          >
            <DialogPrimitive.Title className="sr-only">{alt || "Photo"}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Full screen photo view. Press Escape or click anywhere to close.
            </DialogPrimitive.Description>
            <img
              src={props.src}
              alt={alt}
              className="max-h-[92vh] max-w-[95vw] object-contain cursor-zoom-out"
            />
            <DialogPrimitive.Close className="fixed right-4 top-4 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
