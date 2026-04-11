"use client";

import { useState, useRef, useCallback } from "react";
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

export interface GalleryImage {
  id?: number;
  url: string;
  alt: string;
  order: number;
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group inline-block"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <Image
          src={image.url}
          alt={image.alt || "Gallery image"}
          width={120}
          height={90}
          className="rounded object-cover"
          style={{ width: 120, height: 90 }}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full text-xs items-center justify-center hover:bg-black cursor-pointer hidden group-hover:flex"
      >
        &times;
      </button>
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
          <div className="flex flex-wrap gap-2">
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
