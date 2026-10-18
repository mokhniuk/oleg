"use client";
import { useId } from "react";
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, horizontalListSortingStrategy, rectSortingStrategy, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STRATEGIES = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  grid: rectSortingStrategy,
};

/** Drag-to-reorder container. `ids` are the stable ids of the children, in order. */
export function SortableList({
  ids, onReorder, layout = "vertical", disabled, children,
}: {
  ids: string[];
  onReorder: (ids: string[]) => void;
  layout?: keyof typeof STRATEGIES;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  }
  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={STRATEGIES[layout]} disabled={disabled}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

type HandleProps = Record<string, unknown>;

/** One draggable item. `children` receives the props to spread on the drag handle element. */
export function SortableItem({
  id, as: Tag = "div", className, children,
}: {
  id: string;
  as?: "div" | "span" | "li";
  className?: string;
  children: (handle: HandleProps, isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <Tag
      ref={setNodeRef as never}
      className={className}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 5 : undefined,
        position: "relative",
      }}
    >
      {children({ ...attributes, ...listeners } as HandleProps, isDragging)}
    </Tag>
  );
}
