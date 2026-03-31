import { useState, useEffect, useRef } from 'react';

/**
 * Simple hook to load an image by URL for use with react-konva's Image component.
 */
export default function useImage(url) {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('loading');
  const imgRef = useRef(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    imgRef.current = img;

    img.onload = () => {
      setImage(img);
      setStatus('loaded');
    };

    img.onerror = () => {
      setImage(null);
      setStatus('failed');
    };

    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return [image, status];
}
