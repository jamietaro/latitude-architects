"use client";

import { useState } from "react";

const inputClass =
  "bg-[#28282c] border border-[#444] text-white text-sm h-11 px-3 w-full rounded outline-none focus:border-[#666] transition-colors";
const labelClass = "text-[#888] text-xs uppercase tracking-wider mb-1.5 block";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!newEmail && !newPassword) {
      setError("Please provide a new email or password");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newEmail, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.message);
        setCurrentPassword("");
        setNewEmail("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-screen bg-[#111] p-8">
      <div className="max-w-md">
        <h1 className="text-white text-lg font-medium mb-8">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={inputClass}
              placeholder="Leave blank to keep current"
            />
          </div>

          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Leave blank to keep current"
            />
          </div>

          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {status && <p className="text-green-500 text-sm">{status}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black px-6 py-2 text-sm font-medium rounded hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Update Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
