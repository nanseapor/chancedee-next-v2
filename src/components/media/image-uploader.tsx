import { type } from "os";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { storage } from "@/lib/firebase";
import { SHA256 } from "crypto-js";
import Base64 from "crypto-js/enc-base64";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import type React from "react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper, { type Area } from "react-easy-crop";
import "react-image-crop/dist/ReactCrop.css";
import { LoadingSpinner } from "../common/loading-spinner";

const ImageUploader = ({
  image,
  setImage,
  loading,
  setLoading,
  label,
  children,
}: {
  image?: string;
  setImage: (image: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  label: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const [src, setSrc] = useState<string | null>(null);
  const [zoomCrop, setZoomCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
    };
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"],
    },
  });

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const showCroppedImage = useCallback(async () => {
    setLoading(true);
    if (croppedAreaPixels && src) {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
          );

          const base64Image = canvas.toDataURL("image/jpeg");
          canvas.toBlob((blob) => {
            if (!blob) return;
            const file64 = Base64.stringify(SHA256(base64Image));
            const storageRef = ref(
              storage,
              `companyProfile/${file64}.${`jpg`}`,
            );
            uploadBytesResumable(storageRef, blob)
              .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                  .then((downloadURL) => {
                    setImage(downloadURL);
                    setOpen(false);
                    setLoading(false);
                  })
                  .catch((error) => {
                    setLoading(false);
                    console.error(`Error uploading ${type} photo:`, error);
                    throw error;
                  });
              })
              .catch((error) => {
                setLoading(false);
                console.error(`Error uploading ${type} photo:`, error);
                throw error;
              });
            // setImage(base64Image);
          });
        }
      };
    }
  }, [croppedAreaPixels, src]);

  return (
    <Dialog
      onOpenChange={(state) => {
        setOpen(state);
        if (state) {
          setSrc(null);
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="hidden">
          <p className="text-chancedee22 font-bold">
            {label || `Update your profile picture`}
          </p>
        </DialogTitle>
        <div>
          <div className="flex flex-col gap-5 p-10 pb-0">
            <p className="text-chancedee22 font-bold">
              {label || `Update your profile picture`}
            </p>
            {!loading && src && (
              <p className="text-sm text-slate-900">ย่อหรือขยายเพื่อจัดวาง</p>
            )}
            {loading && <p className="text-sm text-slate-900">กำลังอัปโหลด...</p>}
          </div>
          <div className="flex flex-col px-10 py-5">
            {src ? (
              loading ? (
                <LoadingSpinner />
              ) : (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "160px",
                  }}
                >
                  <Cropper
                    image={src}
                    crop={zoomCrop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setZoomCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              )
            ) : (
              <>
                <div
                  {...getRootProps({
                    className:
                      "dropzone h-40 w-full bg-slate-100 flex flex-col items-center justify-center",
                  })}
                >
                  <input {...getInputProps()} />
                  <p className="text-center text-neutral-500">
                    Drop image here or click to choose image
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-row items-center justify-end gap-2 border-t px-4 py-3">
            <Button
              size={"sm"}
              className="h-[36px] w-28"
              onClick={() => setOpen(false)}
              variant={"secondary"}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              size={"sm"}
              className="h-[36px] w-28"
              onClick={showCroppedImage}
              disabled={loading}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploader;
