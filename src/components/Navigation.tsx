import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Settings, ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Edit2 } from 'lucide-react';
import { NavItem } from '../types';
import { api } from '../api';
import { cn } from '../utils';

interface NavigationProps {
  items: NavItem[];
  isEditing: boolean;
  onUpdateItems: (items: NavItem[]) => void;
  onToggleEdit?: () => void;
  isMobile?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  isEditing,
  onUpdateItems,
  onToggleEdit,
  isMobile = false,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const [pressedItemId, setPressedItemId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;

    // Prevent dragging between different levels
    if (sourceDroppableId !== destinationDroppableId) {
      return;
    }

    if (sourceIndex === destinationIndex) return;

    // Handle top-level items
    if (sourceDroppableId === 'navigation-list') {
      const newItems = Array.from(items);
      const [removed] = newItems.splice(sourceIndex, 1);
      newItems.splice(destinationIndex, 0, removed);

      // Track analytics immediately
      await api.trackDragAndDrop({
        id: result.draggableId,
        from: sourceIndex,
        to: destinationIndex,
      });

      onUpdateItems(newItems);
      return;
    }

    // Handle child items (maintaining their level)
    const parentId = sourceDroppableId.replace('children-', '');
    const parent = items.find(item => item.id === parentId);
    if (parent?.children) {
      const newParentChildren = Array.from(parent.children);
      const [removed] = newParentChildren.splice(sourceIndex, 1);
      newParentChildren.splice(destinationIndex, 0, removed);

      const newItems = items.map(item =>
        item.id === parentId
          ? { ...item, children: newParentChildren }
          : item
      );

      // Track analytics for child items
      await api.trackDragAndDrop({
        id: result.draggableId,
        from: sourceIndex,
        to: destinationIndex,
      });

      onUpdateItems(newItems);
    }
  };

  const handlePressStart = useCallback((itemId: string) => {
    setPressedItemId(itemId);
    longPressTimer.current = setTimeout(() => {
      if (onToggleEdit) {
        onToggleEdit();
      }
    }, 500); // 500ms for long press
  }, [onToggleEdit]);

  const handlePressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setPressedItemId(null);
  }, []);

  const toggleVisibility = (itemId: string) => {
    const updateItemVisibility = (items: NavItem[]): NavItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, visible: !item.visible };
        }
        if (item.children) {
          return {
            ...item,
            children: updateItemVisibility(item.children),
          };
        }
        return item;
      });
    };

    onUpdateItems(updateItemVisibility(items));
  };

  const updateTitle = (itemId: string, newTitle: string) => {
    const updateItemTitle = (items: NavItem[]): NavItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, title: newTitle };
        }
        if (item.children) {
          return {
            ...item,
            children: updateItemTitle(item.children),
          };
        }
        return item;
      });
    };

    onUpdateItems(updateItemTitle(items));
  };

  const renderNavItem = (item: NavItem, index: number, droppableId: string) => (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index}
      isDragDisabled={!isEditing}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "rounded-lg transition-colors group",
            snapshot.isDragging ? "bg-blue-50" : "hover:bg-gray-50",
            !item.visible && "opacity-50",
            pressedItemId === item.id && "bg-gray-100"
          )}
          onTouchStart={() => handlePressStart(item.id)}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(item.id)}
          onMouseUp={handlePressEnd}
        >
          <div className="flex items-center gap-2 p-2">
            {isEditing && (
              <div {...provided.dragHandleProps} className="cursor-grab hover:text-blue-600">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            
            {item.children && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              >
                {expandedItems.has(item.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            
            {editingItemId === item.id ? (
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateTitle(item.id, e.target.value)}
                onBlur={() => setEditingItemId(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingItemId(null)}
                className="flex-1 bg-white px-2 py-1 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoFocus
              />
            ) : (
              <span
                className={cn(
                  "flex-1 px-2 py-1 rounded cursor-pointer",
                  isEditing && "hover:bg-gray-100"
                )}
              >
                {item.title}
              </span>
            )}

            <div className="flex items-center gap-1">
              {isEditing && !editingItemId && (
                <button
                  onClick={() => setEditingItemId(item.id)}
                  className="p-1.5 rounded-full transition-colors hover:bg-blue-100 text-blue-600"
                  title="Edit item"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {isEditing && (
                <button
                  onClick={() => toggleVisibility(item.id)}
                  className={cn(
                    "p-1.5 rounded-full transition-colors",
                    item.visible ? "hover:bg-green-100 text-green-600" : "hover:bg-red-100 text-red-600"
                  )}
                  title={item.visible ? "Hide item" : "Show item"}
                >
                  {item.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {item.children && expandedItems.has(item.id) && (
            <Droppable droppableId={`children-${item.id}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="ml-6 mt-1 space-y-1"
                >
                  {item.children.map((child, childIndex) => 
                    renderNavItem(child, childIndex, `children-${item.id}`)
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="navigation-list">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn("w-full space-y-1", isMobile ? "px-4" : "px-2")}
          >
            {items.map((item, index) => renderNavItem(item, index, "navigation-list"))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};