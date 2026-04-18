"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { fetchImageMeta, formatBytes, type ImageMeta } from "@/lib/imageInfo";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  // Track the URL that meta describes — when value changes to a URL we
  // already have meta for, skip the HEAD fetch (this avoids overriding
  // the original filename from a fresh upload with the renamed
  // server-side filename parsed from the storage URL).
  const [metaForUrl, setMetaForUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setMeta(null);
      setMetaForUrl(null);
      return;
    }
    if (metaForUrl === value) return;
    let cancelled = false;
    fetchImageMeta(value).then((m) => {
      if (cancelled) return;
      setMeta(m);
      setMetaForUrl(value);
    });
    return () => {
      cancelled = true;
    };
  }, [value, metaForUrl]);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        // Stash original filename + size so the effect doesn't override
        // it with the renamed storage filename.
        setMeta({ filename: file.name, sizeBytes: file.size });
        setMetaForUrl(data.url);
        onChange(data.url);
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  if (value) {
    return (
      <div className="inline-block">
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Uploaded"
            width={200}
            height={140}
            className="rounded object-cover"
            style={{ width: 200, height: 140 }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-black cursor-pointer"
          >
            &times;
          </button>
        </div>
        {meta && (
          <div className="text-[#888] text-xs mt-1.5 max-w-[200px]">
            <p className="truncate" title={meta.filename}>
              {meta.filename}
            </p>
            {meta.sizeBytes != null && <p>{formatBytes(meta.sizeBytes)}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
        dragOver ? "border-white/50 bg-white/5" : "border-[#444]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {uploading ? (
        <p className="text-[#888] text-sm">Uploading...</p>
      ) : (
        <p className="text-[#888] text-sm">
          Click to upload or drag and drop
        </p>
      )}
    </div>
  );
}
