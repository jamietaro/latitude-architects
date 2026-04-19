"use client";

import { useState, useEffect, useCallback } from "react";
import slugify from "slugify";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/admin/ImageUpload";
import GalleryUpload, { GalleryImage } from "@/components/admin/GalleryUpload";
import ProjectTeamEditor, {
  type ProjectTeamMemberDraft,
} from "@/components/admin/ProjectTeamEditor";

const TiptapEditor = dynamic(
  () => import("@/components/admin/TiptapEditor"),
  { ssr: false }
);

interface ProjectImage {
  id?: number;
  url: string;
  alt: string;
  order: number;
}

interface ProjectTeamMember {
  id?: number;
  role: string;
  name: string;
  order: number;
  visible: boolean;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  location: string;
  client: string | null;
  year: number;
  status: string;
  sectors: string;
  shortDescription: string | null;
  description: string;
  featured: boolean;
  published: boolean;
  teamVisible: boolean;
  images: ProjectImage[];
  teamMembers?: ProjectTeamMember[];
}

const SECTORS = [
  "Residential",
  "Offices",
  "Mixed Use",
  "Culture and Education",
  "Interiors",
  "Historic Buildings",
  "Urban Design",
  "Competitions",
];

const STATUS_OPTIONS = [
  "Complete",
  "On Site",
  "Planning Consent",
  "In Design",
];

interface ProjectFormState
  extends Omit<Project, "id" | "teamMembers" | "images"> {
  primaryImage: ProjectImage | null;
  galleryImages: ProjectImage[];
  teamMembers: ProjectTeamMemberDraft[];
}

const emptyProject: ProjectFormState = {
  title: "",
  slug: "",
  location: "",
  client: "",
  year: new Date().getFullYear(),
  status: "Complete",
  sectors: "",
  shortDescription: "",
  description: "",
  featured: false,
  published: false,
  teamVisible: true,
  primaryImage: null,
  galleryImages: [],
  teamMembers: [],
};

function genKey() {
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const inputClass =
  "bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors";
const labelClass = "text-[#888] text-xs uppercase tracking-wider mb-1.5 block";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormState>(emptyProject);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/admin/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  function selectProject(project: Project) {
    setSelected(project);
    setIsNew(false);
    const sorted = [...(project.images ?? [])].sort(
      (a, b) => a.order - b.order
    );
    const [first, ...rest] = sorted;
    setForm({
      title: project.title,
      slug: project.slug,
      location: project.location,
      client: project.client || "",
      year: project.year,
      status: project.status,
      sectors: project.sectors,
      shortDescription: project.shortDescription || "",
      description: project.description,
      featured: project.featured,
      published: project.published,
      teamVisible: project.teamVisible ?? true,
      primaryImage: first ?? null,
      galleryImages: rest,
      teamMembers: (project.teamMembers ?? []).map((m, idx) => ({
        _key: m.id != null ? `id-${m.id}` : genKey(),
        id: m.id,
        role: m.role,
        name: m.name,
        order: m.order ?? idx,
        visible: m.visible,
      })),
    });
    setSaveStatus("");
    setMenuOpen(false);
  }

  function handleNew() {
    setSelected(null);
    setIsNew(true);
    setForm({ ...emptyProject });
    setSaveStatus("");
    setMenuOpen(false);
  }

  function updateField(field: string, value: unknown) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && (isNew || prev.slug === slugify(prev.title, { lower: true, strict: true }))) {
        updated.slug = slugify(value as string, { lower: true, strict: true });
      }
      return updated;
    });
  }

  function toggleSector(sector: string) {
    const current = form.sectors ? form.sectors.split(",").filter(Boolean) : [];
    const updated = current.includes(sector)
      ? current.filter((s) => s !== sector)
      : [...current, sector];
    updateField("sectors", updated.join(","));
  }

  // Primary image and gallery are independent fields. Removing the primary
  // clears only the primary slot; gallery images are never promoted into it.
  const mainImage = form.primaryImage?.url ?? null;

  function setMainImage(url: string | null) {
    if (!url) {
      updateField("primaryImage", null);
      return;
    }
    const existing = form.primaryImage;
    updateField(
      "primaryImage",
      existing ? { ...existing, url, order: 0 } : { url, alt: "", order: 0 }
    );
  }

  const galleryImages = form.galleryImages;

  function setGalleryImages(imgs: GalleryImage[]) {
    updateField(
      "galleryImages",
      imgs.map((img, idx) => ({ ...img, order: idx + 1 }))
    );
  }

  function buildSavePayload() {
    const { primaryImage, galleryImages, ...rest } = form;
    const images = primaryImage
      ? [{ ...primaryImage, order: 0 }, ...galleryImages]
      : galleryImages;
    return { ...rest, images };
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus("Saving...");

    try {
      if (isNew) {
        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildSavePayload()),
        });
        if (res.ok) {
          const created = await res.json();
          setSelected(created);
          setIsNew(false);
          setSaveStatus("Saved");
          await fetchProjects();
        } else {
          setSaveStatus("Error saving");
        }
      } else if (selected) {
        const res = await fetch(`/api/admin/projects/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildSavePayload()),
        });
        if (res.ok) {
          const updated = await res.json();
          setSelected(updated);
          setSaveStatus("Saved");
          await fetchProjects();
        } else {
          setSaveStatus("Error saving");
        }
      }
    } catch {
      setSaveStatus("Error saving");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm("Are you sure you want to delete this project?")) return;

    const res = await fetch(`/api/admin/projects/${selected.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSelected(null);
      setIsNew(false);
      setForm({ ...emptyProject });
      await fetchProjects();
    }
  }

  function togglePublish() {
    updateField("published", !form.published);
  }

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const showPanel = isNew || selected;

  return (
    <div className="flex h-screen">
      {/* Centre panel - list */}
      <div className="flex-1 bg-[#111] flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
          <button
            onClick={handleNew}
            className="bg-white text-black px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            New Project
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#28282c] border border-[#444] text-white text-sm h-9 px-3 rounded flex-1 outline-none focus:border-[#666]"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => selectProject(project)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#1e1e22] hover:bg-[#1a1a1e] transition-colors ${
                selected?.id === project.id ? "bg-[#1a1a1e]" : ""
              }`}
            >
              {project.images[0] ? (
                <img
                  src={project.images[0].url}
                  alt=""
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-[#28282c] flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm truncate">{project.title}</p>
                <p className="text-[#666] text-[13px] truncate">
                  {project.slug}
                </p>
              </div>
              <span className="text-[#888] text-[13px] flex-shrink-0">
                {project.year}
              </span>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  project.published ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - editor */}
      {showPanel && (
        <div className="w-[480px] bg-[#1c1c1f] border-l border-[#2a2a2e] flex flex-col h-screen flex-shrink-0">
          {/* Top bar */}
          <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
            <button
              onClick={togglePublish}
              className={`px-4 py-2 text-sm rounded text-white cursor-pointer ${
                form.published
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-[#2563eb] hover:bg-[#1d4ed8]"
              }`}
            >
              {form.published ? "Unpublish" : "Publish"}
            </button>
            <span className="text-[#888] text-xs flex-1">{saveStatus}</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-black px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-[#888] hover:text-white px-2 py-1 text-lg cursor-pointer"
              >
                ...
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[#28282c] border border-[#444] rounded shadow-lg z-10">
                  <button
                    onClick={handleDelete}
                    className="block px-4 py-2 text-sm text-red-400 hover:bg-[#333] w-full text-left cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div className="pb-5 mb-5 border-b border-[#2a2a2e]">
              <label className={labelClass}>Hero Image</label>
              <p className="text-[#666] text-xs mb-2">
                Full-width banner shown at the top of the project page
              </p>
              <ImageUpload value={mainImage} onChange={setMainImage} />
            </div>

            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => updateField("year", parseInt(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Client</label>
              <input
                type="text"
                value={form.client || ""}
                onChange={(e) => updateField("client", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Sectors</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SECTORS.map((sector) => {
                  const checked = form.sectors
                    .split(",")
                    .includes(sector);
                  return (
                    <label
                      key={sector}
                      className="flex items-center gap-1.5 text-sm text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSector(sector)}
                        className="accent-[#2563eb]"
                      />
                      {sector}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Featured</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateField("featured", e.target.checked)}
                  className="accent-[#2563eb]"
                />
                <span className="text-white text-sm">Featured project</span>
              </label>
            </div>

            <div>
              <label className={labelClass}>Short Description</label>
              <textarea
                value={form.shortDescription || ""}
                onChange={(e) =>
                  updateField("shortDescription", e.target.value)
                }
                maxLength={160}
                rows={3}
                className="bg-[#28282c] border border-[#444] text-white text-sm px-3 py-2 w-full rounded outline-none focus:border-[#666] transition-colors resize-none"
              />
              <p className="text-[#666] text-xs mt-1">
                {(form.shortDescription || "").length}/160
              </p>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <TiptapEditor
                content={form.description}
                onChange={(html) => updateField("description", html)}
              />
            </div>

            <div>
              <label className={labelClass}>Gallery Images</label>
              <GalleryUpload
                images={galleryImages}
                onChange={setGalleryImages}
              />
            </div>

            <div className="pt-5 border-t border-[#2a2a2e]">
              <label className={labelClass}>Project Team</label>
              <ProjectTeamEditor
                teamVisible={form.teamVisible}
                onTeamVisibleChange={(v) => updateField("teamVisible", v)}
                members={form.teamMembers}
                onMembersChange={(members) =>
                  updateField("teamMembers", members)
                }
              />
            </div>

            <div>
              <p className="text-[#666] text-xs">
                Set the display order for each category in{" "}
                <a
                  href="/admin/order"
                  className="text-white hover:underline"
                >
                  Order
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
