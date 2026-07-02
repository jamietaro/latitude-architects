"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/admin/ImageUpload";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), {
  ssr: false,
});

interface Block {
  id: number;
  imageUrl: string | null;
  tagline: string | null;
  body: string | null;
}

interface PageContent {
  headline: string | null;
  intro: string | null;
  pullQuote: string | null;
  heroImageTop: string | null;
  heroImageBottom: string | null;
}

const BLOCK_IDS = [1, 2, 3, 4, 5];

const EMPTY_BLOCKS: Block[] = BLOCK_IDS.map((id) => ({
  id,
  imageUrl: null,
  tagline: null,
  body: null,
}));

const EMPTY_PC: PageContent = {
  headline: null,
  intro: null,
  pullQuote: null,
  heroImageTop: null,
  heroImageBottom: null,
};

export default function PracticeAdminPage() {
  const [blocks, setBlocks] = useState<Block[]>(EMPTY_BLOCKS);
  const [pc, setPc] = useState<PageContent>(EMPTY_PC);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/about");
    if (res.ok) {
      const data = await res.json();
      const byId = new Map<number, Block>(
        (data.blocks ?? []).map((b: Block) => [b.id, b])
      );
      setBlocks(
        BLOCK_IDS.map(
          (id) =>
            byId.get(id) ?? { id, imageUrl: null, tagline: null, body: null }
        )
      );
      setPc({ ...EMPTY_PC, ...(data.pageContent ?? {}) });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave() {
    setSaving(true);
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, pageContent: pc }),
      });
      setSaveStatus(res.ok ? "Saved" : "Error saving");
    } catch {
      setSaveStatus("Error saving");
    } finally {
      setSaving(false);
    }
  }

  function updateBlock(id: number, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function updatePc(patch: Partial<PageContent>) {
    setPc((prev) => ({ ...prev, ...patch }));
  }

  if (!loaded) return null;

  const labelClass = "text-[#888] text-xs uppercase tracking-wider mb-1.5 block";
  const inputClass =
    "bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors";
  const areaClass =
    "bg-[#28282c] border border-[#444] text-white text-sm px-3 py-2 w-full rounded outline-none focus:border-[#666] transition-colors resize-none";

  return (
    <div className="h-screen bg-[#111] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
        <h1 className="text-white text-sm font-normal flex-1">
          Practice — About Page
        </h1>
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
          {/* Page-level content */}
          <div className="border border-[#2a2a2e] rounded p-5 space-y-4 bg-[#181818]">
            <h2 className="text-white text-sm font-medium">Top of page</h2>

            <div>
              <label className={labelClass}>Top hero image</label>
              <ImageUpload
                value={pc.heroImageTop}
                onChange={(url) => updatePc({ heroImageTop: url })}
              />
            </div>

            <div>
              <label className={labelClass}>Headline</label>
              <textarea
                value={pc.headline ?? ""}
                onChange={(e) => updatePc({ headline: e.target.value })}
                rows={3}
                className={areaClass}
              />
            </div>

            <div>
              <label className={labelClass}>Intro (lede)</label>
              <textarea
                value={pc.intro ?? ""}
                onChange={(e) => updatePc({ intro: e.target.value })}
                rows={3}
                className={areaClass}
              />
            </div>

            <div>
              <label className={labelClass}>Pull quote</label>
              <input
                type="text"
                value={pc.pullQuote ?? ""}
                onChange={(e) => updatePc({ pullQuote: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Body blocks */}
          <p className="text-[#666] text-xs">
            Content blocks rendered top-to-bottom on the public /practice page.
            Leave any field empty to hide it.
          </p>

          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="border border-[#2a2a2e] rounded p-5 space-y-4 bg-[#181818]"
            >
              <h2 className="text-white text-sm font-medium">Block {idx + 1}</h2>

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

          {/* Bottom hero */}
          <div className="border border-[#2a2a2e] rounded p-5 space-y-4 bg-[#181818]">
            <h2 className="text-white text-sm font-medium">Bottom of page</h2>
            <div>
              <label className={labelClass}>Bottom hero image</label>
              <ImageUpload
                value={pc.heroImageBottom}
                onChange={(url) => updatePc({ heroImageBottom: url })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
