"use client";

import { useState, useEffect, useCallback } from "react";
import slugify from "slugify";
import ImageUpload from "@/components/admin/ImageUpload";
import TiptapEditor from "@/components/admin/TiptapEditor";

interface NewsPost {
  id: number;
  title: string;
  slug: string;
  date: string;
  category: string;
  body: string;
  image: string | null;
  published: boolean;
}

const CATEGORIES = [
  "Planning Consent",
  "Award",
  "Completion",
  "Press",
  "Other",
];

const emptyPost = {
  title: "",
  slug: "",
  date: new Date().toISOString().split("T")[0],
  category: "Planning Consent",
  body: "",
  image: null as string | null,
  published: false,
};

const inputClass =
  "bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors";
const labelClass = "text-[#888] text-xs uppercase tracking-wider mb-1.5 block";

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [selected, setSelected] = useState<NewsPost | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/news");
    if (res.ok) setPosts(await res.json());
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function selectPost(post: NewsPost) {
    setSelected(post);
    setIsNew(false);
    setForm({
      title: post.title,
      slug: post.slug,
      date: post.date.split("T")[0],
      category: post.category,
      body: post.body,
      image: post.image,
      published: post.published,
    });
    setSaveStatus("");
    setMenuOpen(false);
  }

  function handleNew() {
    setSelected(null);
    setIsNew(true);
    setForm({ ...emptyPost });
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

  async function handleSave() {
    setSaving(true);
    setSaveStatus("Saving...");

    try {
      if (isNew) {
        const res = await fetch("/api/admin/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setSelected(created);
          setIsNew(false);
          setSaveStatus("Saved");
          await fetchPosts();
        } else {
          setSaveStatus("Error saving");
        }
      } else if (selected) {
        const res = await fetch(`/api/admin/news/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setSelected(updated);
          setSaveStatus("Saved");
          await fetchPosts();
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
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`/api/admin/news/${selected.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSelected(null);
      setIsNew(false);
      setForm({ ...emptyPost });
      await fetchPosts();
    }
  }

  function togglePublish() {
    updateField("published", !form.published);
  }

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const showPanel = isNew || selected;

  return (
    <div className="flex h-screen">
      {/* Centre panel - list */}
      <div className="flex-1 bg-[#111] flex flex-col min-w-0">
        <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
          <button
            onClick={handleNew}
            className="bg-white text-black px-4 py-2 text-sm rounded hover:bg-gray-100 transition-colors cursor-pointer"
          >
            New Post
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#28282c] border border-[#444] text-white text-sm h-9 px-3 rounded flex-1 outline-none focus:border-[#666]"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((post) => (
            <div
              key={post.id}
              onClick={() => selectPost(post)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#1e1e22] hover:bg-[#1a1a1e] transition-colors ${
                selected?.id === post.id ? "bg-[#1a1a1e]" : ""
              }`}
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt=""
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-[#28282c] flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm truncate">{post.title}</p>
                <p className="text-[#666] text-[13px] truncate">{post.slug}</p>
              </div>
              <span className="text-[#888] text-[13px] flex-shrink-0">
                {post.date.split("T")[0]}
              </span>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  post.published ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      {showPanel && (
        <div className="w-[480px] bg-[#1c1c1f] border-l border-[#2a2a2e] flex flex-col h-screen flex-shrink-0">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <label className={labelClass}>Image</label>
              <ImageUpload
                value={form.image}
                onChange={(url) => updateField("image", url)}
              />
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
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Body</label>
              <TiptapEditor
                content={form.body}
                onChange={(html) => updateField("body", html)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
