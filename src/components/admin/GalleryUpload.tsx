"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fetchImageMeta, formatBytes, type ImageMeta } from "@/lib/imageInfo";

export interface GalleryImage {
  id?: number;
  url: string;
  alt: string;
  order: number;
  // Local-only metadata: present immediately after a fresh upload so we
  // can show filename/size without a HEAD round-trip. Not persisted.
  _localMeta?: ImageMeta;
}

interface GalleryUploadProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

function SortableImage({
  image,
  onRemove,
}: {
  image: GalleryImage;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.url });
  const [fetched, setFetched] = useState<ImageMeta | null>(null);

  useEffect(() => {
    // Skip the network round-trip when fresh-upload metadata is already
    // present on the image (extracted from the File object client-side).
    if (image._localMeta) return;
    let cancelled = false;
    fetchImageMeta(image.url).then((m) => {
      if (!cancelled) setFetched(m);
    });
    return () => {
      cancelled = true;
    };
  }, [image.url, image._localMeta]);

  const meta = image._localMeta ?? fetched;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="inline-flex items-start gap-1"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="flex items-center justify-center h-[90px] w-5 text-[#666] hover:text-white cursor-grab active:cursor-grabbing touch-none"
      >
        <svg
          width="10"
          height="16"
          viewBox="0 0 10 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="2" cy="3" r="1.25" />
          <circle cx="8" cy="3" r="1.25" />
          <circle cx="2" cy="8" r="1.25" />
          <circle cx="8" cy="8" r="1.25" />
          <circle cx="2" cy="13" r="1.25" />
          <circle cx="8" cy="13" r="1.25" />
        </svg>
      </button>
      <div className="relative group inline-block">
        <Image
          src={image.url}
          alt={image.alt || "Gallery image"}
          width={120}
          height={90}
          className="rounded object-cover"
          style={{ width: 120, height: 90 }}
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full text-xs items-center justify-center hover:bg-black cursor-pointer hidden group-hover:flex"
        >
          &times;
        </button>
        {meta && (
          <div
            className="text-[#888] text-[11px] mt-1 leading-tight"
            style={{ width: 120 }}
          >
            <p className="truncate" title={meta.filename}>
              {meta.filename}
            </p>
            {meta.sizeBytes != null && <p>{formatBytes(meta.sizeBytes)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryUpload({
  images,
  onChange,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const uploadFiles = useCallback(
    async (files: FileList) => {
      setUploading(true);
      const newImages: GalleryImage[] = [];

      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) continue;

          const data = await res.json();
          newImages.push({
            url: data.url,
            alt: "",
            order: images.length + newImages.length,
            _localMeta: { filename: file.name, sizeBytes: file.size },
          });
        } catch (err) {
          console.error("Upload error:", err);
        }
      }

      onChange([...images, ...newImages]);
      setUploading(false);
    },
    [images, onChange]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);

    const reordered = arrayMove(images, oldIndex, newIndex).map(
      (img, idx) => ({ ...img, order: idx })
    );
    onChange(reordered);
  }

  function handleRemove(index: number) {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, idx) => ({ ...img, order: idx }));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.url)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <SortableImage
                key={image.url}
                image={image}
                onRemove={() => handleRemove(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#444] rounded p-4 text-center cursor-pointer hover:border-white/50 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {uploading ? (
          <p className="text-[#888] text-sm">Uploading...</p>
        ) : (
          <p className="text-[#888] text-sm">Add images</p>
        )}
      </div>
    </div>
  );
}
