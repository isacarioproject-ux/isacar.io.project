"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Minus,
  StickyNote,
  Type,
  Image,
  CheckSquare
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface ToolItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color?: string;
  action?: () => void;
  disabled?: boolean;
}

interface Props {
  tools: ToolItem[];
  activeTool: string;
  onToolSelect: (toolId: string) => void;
  rightSlot?: React.ReactNode; // optional extra content rendered inside without changing size
}

const FuturisticToolbar = ({ tools, activeTool, onToolSelect, rightSlot }: Props) => {
  const handleToolClick = (tool: ToolItem) => {
    if (tool.disabled) return;
    onToolSelect(tool.id);
    if (tool.action) {
      tool.action();
    }
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 z-50 scale-[0.4] md:scale-[0.5] lg:scale-[0.6] origin-bottom">
        <div className="relative flex items-center justify-center gap-3 bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-full px-8 py-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        
          {/* Active Indicator Glow */}
          <motion.div
            layoutId="active-tool-glow"
            className="absolute w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-3xl -z-10 opacity-30"
            animate={{
              left: `calc(${tools.findIndex(t => t.id === activeTool) * (100 / tools.length)}% + ${100 / tools.length / 2}%)`,
              translateX: "-50%",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />

          {tools.map((tool, index) => {
            const isActive = tool.id === activeTool;
            return (
              <motion.div key={tool.id} className="relative flex flex-col items-center group">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleToolClick(tool)}
                      whileHover={{ 
                        scale: 1.15,
                        y: -6,
                        rotateZ: isActive ? 0 : 5
                      }}
                      whileTap={{ scale: 0.9 }}
                      animate={{ 
                        scale: isActive ? 1.3 : 1,
                        y: isActive ? -4 : 0,
                        rotateZ: isActive ? [0, -5, 5, -5, 0] : 0
                      }}
                      transition={{
                        scale: { type: "spring", stiffness: 400, damping: 20 },
                        y: { type: "spring", stiffness: 400, damping: 20 },
                        rotateZ: { duration: 0.5 }
                      }}
                      className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${tool.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                      aria-disabled={tool.disabled ? true : undefined}
                      style={{
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        boxShadow: isActive
                          ? '0 10px 40px rgba(99, 102, 241, 0.2), 0 0 20px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                          : '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <motion.div
                        animate={{
                          rotate: isActive ? [0, -10, 10, -10, 0] : 0,
                          scale: isActive ? [1, 1.1, 1] : 1
                        }}
                        transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
                        className={isActive ? "text-white" : "text-gray-600 dark:text-gray-300"}
                        style={{
                          filter: isActive ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.25))' : 'none'
                        }}
                      >
                        {tool.icon}
                      </motion.div>

                      {/* Highlight ring */}
                      {isActive && (
                        <motion.div
                          layoutId="active-ring"
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
                            border: '2px solid rgba(255, 255, 255, 0.4)'
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {tool.label}
                  </TooltipContent>
                </Tooltip>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute -bottom-2 w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            );
          })}
          {/* Right slot content (does not affect toolbar size) */}
          {rightSlot ? (
            <div className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {rightSlot}
            </div>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FuturisticToolbar;
