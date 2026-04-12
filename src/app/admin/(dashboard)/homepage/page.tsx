"use client";

import { useState, useEffect, useCallback } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function HomepagePage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroImageOpacity, setHeroImageOpacity] = useState(1.0);
  const [heroTagline, setHeroTagline] = useState("Celebrating 25 years of crafting exceptional buildings across London and beyond.");
  const [contactImageUrl, setContactImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [bannerTagline, setBannerTagline] = useState("Buildings for people.");
  const [bannerCta, setBannerCta] = useState("Get in touch");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/homepage");
    if (res.ok) {
      const data = await res.json();
      setHeroImageUrl(data.heroImageUrl ?? null);
      setHeroImageOpacity(data.heroImageOpacity ?? 1.0);
      setHeroTagline(data.heroTagline ?? "Celebrating 25 years of crafting exceptional buildings across London and beyond.");
      setContactImageUrl(data.contactImageUrl ?? null);
      setBannerImageUrl(data.bannerImageUrl ?? null);
      setBannerTagline(data.bannerTagline ?? "Buildings for people.");
      setBannerCta(data.bannerCta ?? "Get in touch");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImageUrl, heroImageOpacity, heroTagline, contactImageUrl, bannerImageUrl, bannerTagline, bannerCta }),
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

  if (!loaded) return null;

  const labelClass = "text-[#888] text-xs uppercase tracking-wider mb-1.5 block";

  return (
    <div className="h-screen bg-[#111] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
        <h1 className="text-white text-sm font-normal flex-1">Site Settings</h1>
        <span className="text-[#888] text-xs">{saveStatus}</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="max-w-[480px]">
          <label className={labelClass}>Hero Image</label>
          <p className="text-[#666] text-xs mb-2">
            Full-viewport background image shown on the homepage
          </p>
          <ImageUpload value={heroImageUrl} onChange={setHeroImageUrl} />
          <div className="mt-4">
            <label className={labelClass}>Hero Image Opacity</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={heroImageOpacity}
                onChange={(e) => setHeroImageOpacity(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-white text-sm w-10 text-right">
                {heroImageOpacity.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Hero Tagline</label>
            <p className="text-[#666] text-xs mb-2">
              Displayed below the hero section, above the projects grid
            </p>
            <textarea
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              rows={2}
              className="bg-[#28282c] border border-[#444] text-white text-sm px-3 py-2 w-full rounded outline-none focus:border-[#666] transition-colors resize-none"
            />
          </div>
        </div>

        <div className="max-w-[480px] pt-8 border-t border-[#2a2a2e]">
          <label className={labelClass}>Contact Page Image</label>
          <p className="text-[#666] text-xs mb-2">
            Image displayed on the Practice &gt; Contact page
          </p>
          <ImageUpload value={contactImageUrl} onChange={setContactImageUrl} />
        </div>

        <div className="max-w-[480px] pt-8 border-t border-[#2a2a2e]">
          <label className={labelClass}>Banner Image</label>
          <p className="text-[#666] text-xs mb-2">
            Background image for the banner section on the homepage
          </p>
          <ImageUpload value={bannerImageUrl} onChange={setBannerImageUrl} />
          <div className="mt-4">
            <label className={labelClass}>Banner Tagline</label>
            <input
              type="text"
              value={bannerTagline}
              onChange={(e) => setBannerTagline(e.target.value)}
              className="bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors"
            />
          </div>
          <div className="mt-4">
            <label className={labelClass}>Banner CTA Label</label>
            <input
              type="text"
              value={bannerCta}
              onChange={(e) => setBannerCta(e.target.value)}
              className="bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors"
            />
            <p className="text-[#666] text-xs mt-1">Links to /practice/contact</p>
          </div>
        </div>
      </div>
    </div>
  );
}
