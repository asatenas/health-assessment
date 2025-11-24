'use client';

import { regularPrompt } from '@/lib/ai/prompts';
import { useEffect, useRef, useState } from 'react';

interface PromptTesterProps {
  onPromptChange: (prompt: string) => void;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
}

interface Position {
  x: number;
  y: number;
}

export function PromptTester({
  onPromptChange,
  hasChanges,
  setHasChanges,
}: PromptTesterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(regularPrompt);
  const [isUsingCustom, setIsUsingCustom] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    return {
      x: window.innerWidth * 0.015,
      y: window.innerHeight * 0.1,
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  const handlePromptChange = (newPrompt: string) => {
    setCustomPrompt(newPrompt);
    onPromptChange(newPrompt);
  };

  const handleApplyPrompt = () => {
    setIsUsingCustom(true);
    setHasChanges(true);
    handlePromptChange(customPrompt);
    setIsExpanded(false);
  };

  const handleToggleCustomPrompt = (enabled: boolean) => {
    setIsUsingCustom(enabled);
    setHasChanges(enabled);
    handlePromptChange(customPrompt);
  };

  const handleResetPrompt = () => {
    setIsUsingCustom(false);
    setHasChanges(false);
    handlePromptChange(regularPrompt);
  };

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - (isExpanded ? 500 : 150);
      const maxY = window.innerHeight - (isExpanded ? 600 : 50);

      const clampedPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      };

      // Check if position actually changed (meaning user dragged)
      setPosition((prev) => {
        if (prev.x !== clampedPosition.x || prev.y !== clampedPosition.y) {
          setHasDragged(true);
        }
        return clampedPosition;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isExpanded]);

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (!dragRef.current) return;

    const rect = dragRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    setHasDragged(false); // Reset drag flag
  };

  const handleButtonClick = () => {
    // Only expand if user didn't drag
    if (!hasDragged) {
      setIsExpanded(true);
    }
    setHasDragged(false); // Reset for next interaction
  };

  if (!isExpanded) {
    return (
      <div
        ref={dragRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        className="z-50"
      >
        <button
          type="button"
          onClick={handleButtonClick}
          onMouseDown={handleMouseDown}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors shadow-lg cursor-move"
        >
          Prompt Tester
        </button>
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="z-50 w-[500px] bg-background border border-border rounded-lg shadow-2xl flex flex-col max-h-[600px]"
    >
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between p-3 border-b border-border cursor-move"
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Prompt Tester</h3>
          {hasChanges && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              (unsaved changes - save prompt before exiting!)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="p-3 border-b border-border">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isUsingCustom}
            onChange={(e) => handleToggleCustomPrompt(e.target.checked)}
            className="rounded"
          />
          <span>Use custom prompt</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <textarea
          value={customPrompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          disabled={!isUsingCustom}
          className="size-full min-h-[400px] p-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter custom system prompt..."
        />
      </div>

      <div className="p-3 border-t border-border flex justify-between items-center">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {customPrompt.length} characters
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetPrompt}
            disabled={!isUsingCustom}
            className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={handleApplyPrompt}
            disabled={!hasChanges || !isUsingCustom}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
