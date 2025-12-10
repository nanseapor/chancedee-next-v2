"use client";

import getAssets from "@/lib/assets";
import type { Popup } from "@/lib/popup";
import { popupBannerAtom } from "@/store/atom-store";
import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";

const PopupBanner = ({
  popups,
  title,
}: { popups: Popup[]; title?: string }) => {
  const [open, setOpen] = useAtom(popupBannerAtom);

  useEffect(() => {
    const hasShownPopup = sessionStorage.getItem("hasShownPopup");
    if (!hasShownPopup && popups.length > 0) {
      setOpen(true);
      sessionStorage.setItem("hasShownPopup", "true");
    }
  }, [setOpen, popups]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-11/12 max-w-4xl h-fit max-h-[800px] p-0 transition-all duration-1000 ease-in-out py-4">
        <DialogTitle className="text-xl font-semibold hidden">
          {"Dialog Title"}
        </DialogTitle>
        <div className="flex-1 overflow-hidden p-4">
          {popups?.map((data, index) => (
            <div key={index} className="md:px-5">
              <div className="flex flex-col items-start text-start mb-8">
                <h2 className="text-xl md:text-3xl leading-tight font-semibold mb-4">
                  {data.title}
                </h2>
                <p className="text-base md:text-lg mb-4">{data.sub_title}</p>
                <div className="w-full aspect-video relative mb-4">
                  <a
                    href={data.popup_link_url || "#"}
                    className="block w-full h-full"
                  >
                    <Image
                      alt={data.title || "Main Image Data"}
                      src={
                        data.featured_image
                          ? getAssets(data.featured_image)
                          : "/images/placeholder.png"
                      }
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-lg object-cover"
                    />
                  </a>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupBanner;
