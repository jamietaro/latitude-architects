"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PROJECT_TEAM_ROLES } from "@/lib/projectTeamRoles";

export interface ProjectTeamMemberDraft {
  // _key is a stable client-side identifier used for dnd-kit's
  // sortable IDs. Existing rows can use the DB id; new rows generate
  // a fresh string at creation time.
  _key: string;
  id?: number;
  role: string;
  name: string;
  order: number;
  visible: boolean;
}

interface RoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

// Combobox: shows predefined roles in a dropdown but accepts free text.
function RoleCombobox({ value, onChange }: RoleComboboxProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = value
    ? PROJECT_TEAM_ROLES.filter((r) =>
        r.toLowerCase().includes(value.toLowerCase())
      )
    : PROJECT_TEAM_ROLES;

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Role"
        className="bg-[#28282c] border border-[#444] text-white text-sm h-9 px-3 w-full rounded outline-none focus:border-[#666] transition-colors"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-[#28282c] border border-[#444] rounded shadow-lg max-h-56 overflow-y-auto">
          {filtered.map((role) => (
            <button
              key={role}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(role);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-1.5 text-sm text-white hover:bg-[#333] cursor-pointer"
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableRow({
  member,
  onChange,
  onRemove,
}: {
  member: ProjectTeamMemberDraft;
  onChange: (patch: Partial<ProjectTeamMemberDraft>) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member._key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-[#1c1c1f]"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-[#666] hover:text-white px-1 cursor-grab active:cursor-grabbing select-none"
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>

      <RoleCombobox
        value={member.role}
        onChange={(v) => onChange({ role: v })}
      />

      <input
        type="text"
        value={member.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Name"
        className="bg-[#28282c] border border-[#444] text-white text-sm h-9 px-3 flex-1 min-w-0 rounded outline-none focus:border-[#666] transition-colors"
      />

      <label
        className="flex items-center gap-1.5 text-[#888] text-xs cursor-pointer flex-shrink-0"
        title="Show on public page"
      >
        <input
          type="checkbox"
          checked={member.visible}
          onChange={(e) => onChange({ visible: e.target.checked })}
          className="accent-[#2563eb]"
        />
        Visible
      </label>

      <button
        type="button"
        onClick={onRemove}
        className="text-[#888] hover:text-red-400 text-lg w-7 h-7 flex items-center justify-center cursor-pointer flex-shrink-0"
        aria-label="Remove team member"
      >
        ×
      </button>
    </div>
  );
}

interface ProjectTeamEditorProps {
  teamVisible: boolean;
  onTeamVisibleChange: (v: boolean) => void;
  members: ProjectTeamMemberDraft[];
  onMembersChange: (members: ProjectTeamMemberDraft[]) => void;
}

export default function ProjectTeamEditor({
  teamVisible,
  onTeamVisibleChange,
  members,
  onMembersChange,
}: ProjectTeamEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = members.findIndex((m) => m._key === active.id);
    const newIndex = members.findIndex((m) => m._key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(members, oldIndex, newIndex).map((m, idx) => ({
      ...m,
      order: idx,
    }));
    onMembersChange(reordered);
  }

  function updateMember(key: string, patch: Partial<ProjectTeamMemberDraft>) {
    onMembersChange(
      members.map((m) => (m._key === key ? { ...m, ...patch } : m))
    );
  }

  function removeMember(key: string) {
    onMembersChange(
      members
        .filter((m) => m._key !== key)
        .map((m, idx) => ({ ...m, order: idx }))
    );
  }

  function addMember() {
    onMembersChange([
      ...members,
      {
        _key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "",
        name: "",
        order: members.length,
        visible: true,
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={teamVisible}
          onChange={(e) => onTeamVisibleChange(e.target.checked)}
          className="accent-[#2563eb]"
        />
        <span className="text-white text-sm">
          Show project team on public page
        </span>
      </label>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={members.map((m) => m._key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {members.map((m) => (
              <SortableRow
                key={m._key}
                member={m}
                onChange={(patch) => updateMember(m._key, patch)}
                onRemove={() => removeMember(m._key)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addMember}
        className="text-[#888] text-sm hover:text-white cursor-pointer"
      >
        + Add team member
      </button>
    </div>
  );
}
