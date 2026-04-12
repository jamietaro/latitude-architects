"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/admin/ImageUpload";

const TiptapEditor = dynamic(
  () => import("@/components/admin/TiptapEditor"),
  { ssr: false }
);

interface Block {
  id: number;
  imageUrl: string | null;
  tagline: string | null;
  body: string | null;
}

const EMPTY: Block[] = [1, 2, 3, 4].map((id) => ({
  id,
  imageUrl: null,
  tagline: null,
  body: null,
}));

export default function PracticeAdminPage() {
  const [blocks, setBlocks] = useState<Block[]>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchBlocks = useCallback(async () => {
    const res = await fetch("/api/admin/about");
    if (res.ok) {
      const data: Block[] = await res.json();
      // Normalise to 4 slots
      const byId = new Map(data.map((b) => [b.id, b]));
      setBlocks(
        [1, 2, 3, 4].map(
          (id) => byId.get(id) ?? { id, imageUrl: null, tagline: null, body: null }
        )
      );
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  async function handleSave() {
    setSaving(true);
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (res.ok) {
        setSaveStatus("Saved");
      } else {
        setSaveStatus("Error saving");
      }
    } catch {
      setSaveStatus("Error saving");
    } finally {
      setSaving(false);
    }
  }

  function updateBlock(id: number, patch: Partial<Block>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }

  if (!loaded) return null;

  const labelClass = "text-[#888] text-xs uppercase tracking-wider mb-1.5 block";
  const inputClass =
    "bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors";

  return (
    <div className="h-screen bg-[#111] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
        <h1 className="text-white text-sm font-normal flex-1">Practice — About Page</h1>
        <span className="text-[#888] text-xs">{saveStatus}</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[640px] space-y-8">
          <p className="text-[#666] text-xs">
            Four editable content blocks rendered top-to-bottom on the public
            /practice page. Leave any field empty to hide it.
          </p>

          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="border border-[#2a2a2e] rounded p-5 space-y-4 bg-[#181818]"
            >
              <h2 className="text-white text-sm font-medium">
                Block {idx + 1}
              </h2>

              <div>
                <label className={labelClass}>Image</label>
                <ImageUpload
                  value={block.imageUrl}
                  onChange={(url) => updateBlock(block.id, { imageUrl: url })}
                />
              </div>

              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  type="text"
                  value={block.tagline ?? ""}
                  onChange={(e) =>
                    updateBlock(block.id, { tagline: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Body</label>
                <TiptapEditor
                  content={block.body ?? ""}
                  onChange={(html) => updateBlock(block.id, { body: html })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
