import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CellProps {
  x: number;
  y: number;
  isWalkable: boolean;
  isStart: boolean;
  isInPath: boolean;
  isCurrent: boolean;
  onPointerDown: (e: React.PointerEvent, x: number, y: number) => void;
  onPointerEnter: (e: React.PointerEvent, x: number, y: number) => void;
  size: number;
}

export const Cell: React.FC<CellProps> = ({
  x,
  y,
  isWalkable,
  isStart,
  isInPath,
  isCurrent,
  onPointerDown,
  onPointerEnter,
  size
}) => {
  const [justConnected, setJustConnected] = useState(false);

  // Trigger a temporary state when the cell is newly added to the path
  useEffect(() => {
    if (isInPath) {
      setJustConnected(true);
      const timer = setTimeout(() => setJustConnected(false), 300);
      return () => clearTimeout(timer);
    } else {
      setJustConnected(false);
    }
  }, [isInPath]);

  if (!isWalkable) {
    return <div style={{ width: size, height: size }} className="m-1" />;
  }

  return (
    <motion.div
      style={{ width: size, height: size }}
      className={`
        m-1 rounded-[22%] cursor-pointer select-none touch-none
        relative flex items-center justify-center overflow-hidden
        transition-colors duration-300
        ${isInPath 
          ? 'bg-[#E33B58] shadow-[inset_0_3px_6px_rgba(255,255,255,0.3),inset_0_-5px_8px_rgba(0,0,0,0.3),0_4px_12px_rgba(227,59,88,0.4)]' 
          : 'bg-[#404D61] shadow-[inset_0_3px_6px_rgba(255,255,255,0.1),inset_0_-5px_8px_rgba(0,0,0,0.4),0_4px_10px_rgba(0,0,0,0.3)]'}
      `}
      onPointerDown={(e) => onPointerDown(e, x, y)}
      onPointerEnter={(e) => onPointerEnter(e, x, y)}
      animate={
        isInPath 
          ? { scale: [1, 0.85, 1.05, 1], y: [0, 2, -1, 0] } 
          : { scale: 1, y: 0 }
      }
      transition={{ 
        duration: 0.35, 
        times: [0, 0.4, 0.7, 1],
        ease: "easeOut"
      }}
      whileHover={{ scale: 0.95 }}
      whileTap={{ scale: 0.9, y: 2 }}
    >
      {/* Soft gradient overlay for premium look */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[22%]" />

      {/* Ripple/Flash Effect on Connect */}
      <AnimatePresence>
        {justConnected && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-[22%] bg-white mix-blend-overlay pointer-events-none"
          />
        )}
      </AnimatePresence>

      {isStart && (
        <motion.div 
          className={`w-[35%] h-[35%] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_2px_4px_rgba(255,255,255,0.4)] z-20 ${isInPath ? 'bg-white' : 'bg-white/90'}`} 
          animate={isInPath ? { scale: [1, 1.5, 1] } : { scale: [1, 1.1, 1] }}
          transition={{ duration: isInPath ? 0.3 : 2, repeat: isInPath ? 0 : Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
};
