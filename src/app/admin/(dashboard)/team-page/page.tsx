"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(
  () => import("@/components/admin/TiptapEditor"),
  { ssr: false }
);

export default function TeamPageContentAdmin() {
  const [heading, setHeading] = useState("");
  const [intro, setIntro] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchContent = useCallback(async () => {
    const res = await fetch("/api/admin/team-page");
    if (res.ok) {
      const data = await res.json();
      setHeading(data.heading ?? "");
      setIntro(data.intro ?? "");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  async function handleSave() {
    setSaving(true);
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/admin/team-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heading, intro }),
      });
      setSaveStatus(res.ok ? "Saved" : "Error saving");
    } catch {
      setSaveStatus("Error saving");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  const labelClass = "text-[#888] text-xs uppercase tracking-wider mb-1.5 block";
  const inputClass =
    "bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors";

  return (
    <div className="h-screen bg-[#111] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
        <h1 className="text-white text-sm font-normal flex-1">Team — Page Content</h1>
        <Link
          href="/admin/team"
          className="text-[#888] text-xs hover:text-white"
        >
          ← Team members
        </Link>
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
        <div className="max-w-[640px] space-y-6">
          <p className="text-[#666] text-xs">
            This heading and intro appear at the top of the public /people/team
            page, above the team members grid. Leave either field empty to hide
            it.
          </p>

          <div>
            <label className={labelClass}>Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Intro</label>
            <TiptapEditor content={intro} onChange={setIntro} />
          </div>
        </div>
      </div>
    </div>
  );
}
