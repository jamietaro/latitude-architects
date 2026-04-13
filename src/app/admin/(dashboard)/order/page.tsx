"use client";

import { useState, useEffect, useCallback } from "react";
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
import { CATEGORY_TABS, FEATURED_CATEGORY } from "@/lib/categories";

interface OrderItem {
  id: number;
  title: string;
  location: string;
}

function SortableRow({ item }: { item: OrderItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 bg-[#181818] border border-[#2a2a2e] rounded"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#666] text-lg select-none"
        aria-label="Drag handle"
      >
        ⋮⋮
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm truncate">{item.title}</p>
        <p className="text-[#666] text-xs truncate">{item.location}</p>
      </div>
    </div>
  );
}

export default function OrderAdminPage() {
  const [activeCategory, setActiveCategory] = useState<string>(FEATURED_CATEGORY);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchItems = useCallback(async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/order?category=${encodeURIComponent(category)}`
      );
      if (res.ok) {
        const data = (await res.json()) as OrderItem[];
        setItems(data);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(activeCategory);
  }, [activeCategory, fetchItems]);

  async function persistOrder(next: OrderItem[]) {
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/admin/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeCategory,
          projectIds: next.map((i) => i.id),
        }),
      });
      if (res.ok) {
        setSaveStatus("Saved");
      } else {
        setSaveStatus("Error saving");
      }
    } catch {
      setSaveStatus("Error saving");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    persistOrder(next);
  }

  return (
    <div className="h-screen bg-[#111] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e]">
        <h1 className="text-white text-sm font-normal flex-1">Project Order</h1>
        <span className="text-[#888] text-xs">{saveStatus}</span>
      </div>

      {/* Tab strip */}
      <div className="border-b border-[#2a2a2e] overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {CATEGORY_TABS.map((tab) => {
            const isActive = tab.slug === activeCategory;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveCategory(tab.slug)}
                className={`px-3 py-2 text-sm rounded whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-white text-black"
                    : "text-[#888] hover:text-white hover:bg-[#1a1a1e]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-[#666] text-xs">
          Only published projects appear here. To set the order of an
          unpublished project, publish it first, then return to this page.
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-[720px]">
          {loading ? (
            <p className="text-[#666] text-sm py-8">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-[#666] text-sm py-8">
              No published projects in this category.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <SortableRow key={item.id} item={item} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
