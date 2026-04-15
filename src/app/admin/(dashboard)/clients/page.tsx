"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(
  () => import("@/components/admin/TiptapEditor"),
  { ssr: false }
);

export default function ClientsAdmin() {
  const [heading, setHeading] = useState("");
  const [intro, setIntro] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchContent = useCallback(async () => {
    const res = await fetch("/api/admin/clients");
    if (res.ok) {
      const data = await res.json();
      setHeading(data.heading ?? "");
      setIntro(data.intro ?? "");
      setBody(data.body ?? "");
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
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heading, intro, body }),
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
        <h1 className="text-white text-sm font-normal flex-1">Clients page</h1>
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
            Full content of the public /practice/clients page. The body is
            typically a bulleted list of client names — paste or edit freely.
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

          <div>
            <label className={labelClass}>Body</label>
            <TiptapEditor content={body} onChange={setBody} />
          </div>
        </div>
      </div>
    </div>
  );
}
