"use client";

import { useState, useEffect, useCallback } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Slide {
  id?: number;
  imageUrl: string;
  opacity: number;
  order: number;
  projectId: number | null;
}

interface ProjectOption {
  id: number;
  title: string;
  slug: string;
}

export default function HomepagePage() {
  const [heroSlides, setHeroSlides] = useState<Slide[]>([]);
  const [heroTagline, setHeroTagline] = useState(
    "Celebrating 25 years of crafting exceptional buildings across London and beyond."
  );
  const [contactImageUrl, setContactImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [bannerTagline, setBannerTagline] = useState("Buildings for people.");
  const [bannerCta, setBannerCta] = useState("Get in touch");
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fetchSettings = useCallback(async () => {
    const [settingsRes, projectsRes] = await Promise.all([
      fetch("/api/admin/homepage"),
      fetch("/api/admin/projects?published=true"),
    ]);

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      setHeroSlides(
        (data.heroSlides ?? []).map((s: Slide) => ({
          id: s.id,
          imageUrl: s.imageUrl,
          opacity: s.opacity ?? 0.2,
          order: s.order ?? 0,
          projectId: s.projectId ?? null,
        }))
      );
      setHeroTagline(
        data.heroTagline ??
          "Celebrating 25 years of crafting exceptional buildings across London and beyond."
      );
      setContactImageUrl(data.contactImageUrl ?? null);
      setBannerImageUrl(data.bannerImageUrl ?? null);
      setBannerTagline(data.bannerTagline ?? "Buildings for people.");
      setBannerCta(data.bannerCta ?? "Get in touch");
    }

    if (projectsRes.ok) {
      const projects = await projectsRes.json();
      setProjectOptions(
        projects.map((p: ProjectOption) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
        }))
      );
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
        body: JSON.stringify({
          heroTagline,
          contactImageUrl,
          bannerImageUrl,
          bannerTagline,
          bannerCta,
          heroSlides: heroSlides.map((s, idx) => ({
            imageUrl: s.imageUrl,
            opacity: s.opacity,
            order: idx,
            projectId: s.projectId,
          })),
        }),
      });
      if (res.ok) {
        setSaveStatus("Saved");
        // Refresh from server to get new IDs
        await fetchSettings();
      } else {
        setSaveStatus("Error saving");
      }
    } catch {
      setSaveStatus("Error saving");
    } finally {
      setSaving(false);
    }
  }

  function updateSlide(index: number, patch: Partial<Slide>) {
    setHeroSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  function addSlide() {
    setHeroSlides((prev) => [
      ...prev,
      { imageUrl: "", opacity: 0.2, order: prev.length, projectId: null },
    ]);
  }

  function removeSlide(index: number) {
    setHeroSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSlide(index: number, direction: -1 | 1) {
    setHeroSlides((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
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
        <div className="max-w-[640px]">
          <label className={labelClass}>Hero Slides</label>
          <p className="text-[#666] text-xs mb-4">
            Slides cycle every 7 seconds on the homepage. Each slide can
            optionally link to a project — the project title and sectors show
            as overlay text.
          </p>

          <div className="space-y-4">
            {heroSlides.map((slide, i) => (
              <div
                key={i}
                className="border border-[#2a2a2e] rounded p-4 space-y-3 bg-[#181818]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs">Slide {i + 1}</span>
                  <div className="flex-1" />
                  <button
                    onClick={() => moveSlide(i, -1)}
                    disabled={i === 0}
                    className="text-[#888] text-xs px-2 py-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSlide(i, 1)}
                    disabled={i === heroSlides.length - 1}
                    className="text-[#888] text-xs px-2 py-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeSlide(i)}
                    className="text-red-400 text-xs px-2 py-1 hover:text-red-300 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <ImageUpload
                  value={slide.imageUrl || null}
                  onChange={(url) => updateSlide(i, { imageUrl: url ?? "" })}
                />

                <div>
                  <label className="text-[#888] text-xs mb-1 block">
                    Opacity: {slide.opacity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={slide.opacity}
                    onChange={(e) =>
                      updateSlide(i, { opacity: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-[#888] text-xs mb-1 block">
                    Linked project (for overlay title)
                  </label>
                  <select
                    value={slide.projectId ?? ""}
                    onChange={(e) =>
                      updateSlide(i, {
                        projectId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666]"
                  >
                    <option value="">No project (no overlay text)</option>
                    {projectOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addSlide}
            className="mt-4 bg-[#28282c] border border-[#444] text-white text-sm px-4 py-2 rounded hover:bg-[#333] cursor-pointer"
          >
            + Add slide
          </button>

          <div className="mt-6">
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
