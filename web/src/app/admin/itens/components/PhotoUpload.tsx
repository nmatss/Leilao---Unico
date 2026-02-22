"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  existingPhotos?: string[];
  onPhotosChange: (files: File[], existingUrls: string[]) => void;
}

export default function PhotoUpload({ existingPhotos = [], onPhotosChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existing, setExisting] = useState<string[]>(existingPhotos);
  const onPhotosChangeRef = useRef(onPhotosChange);
  onPhotosChangeRef.current = onPhotosChange;

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const notify = useCallback(() => {
    onPhotosChangeRef.current(files, existing);
  }, [files, existing]);

  useEffect(() => {
    notify();
  }, [notify]);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = "";
  }

  function removeNew(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExisting(index: number) {
    setExisting((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
      <div className="flex flex-wrap gap-3 mb-3">
        {existing.map((url, i) => (
          <div key={`ex-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeExisting(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              x
            </button>
          </div>
        ))}
        {previews.map((url, i) => (
          <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeNew(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              x
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Adicionar fotos
      </button>
    </div>
  );
}
