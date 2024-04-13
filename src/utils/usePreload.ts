import { useEffect } from "react";
const usePreloadImages = (images: string[], onImagesLoaded?: (loadedImages: string[]) => void) => {
  useEffect(() => {
    const loaded: string[] = [];
    for (const imageUrl of images) {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        loaded.push(imageUrl);
        if (loaded.length === images.length) {
          onImagesLoaded && onImagesLoaded(loaded);
        }
      };
    }
  }, []);
}

export {
  usePreloadImages
};