"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/admin/ImageUpload";

const TiptapEditor = dynamic(
  () => import("@/components/admin/TiptapEditor"),
  { ssr: false }
);

export default function ContactAdmin() {
  const [heading, setHeading] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchContent = useCallback(async () => {
    const res = await fetch("/api/admin/contact");
    if (res.ok) {
      const data = await res.json();
      setHeading(data.heading ?? "");
      setAddress(data.address ?? "");
      setPhone(data.phone ?? "");
      setEmail(data.email ?? "");
      setBody(data.body ?? "");
      setImageUrl(data.imageUrl ?? null);
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
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heading, address, phone, email, body, imageUrl }),
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
        <h1 className="text-white text-sm font-normal flex-1">Contact page</h1>
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
            All content for the public /contact page.
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
            <label className={labelClass}>Address</label>
            <TiptapEditor content={address} onChange={setAddress} />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Body</label>
            <p className="text-[#666] text-xs mb-2">
              Optional additional contact text (rendered below the address).
            </p>
            <TiptapEditor content={body} onChange={setBody} />
          </div>

          <div>
            <label className={labelClass}>Image</label>
            <p className="text-[#666] text-xs mb-2">
              Displayed next to the contact details on the public /contact page.
            </p>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
