import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cell as CellType, LevelData } from '../../types/game';
import { Cell } from './Cell';
import { isValidMove, isWalkable, isCellInPath, checkWinCondition, isDeadEnd } from '../../engine/gameRules';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../utils/audio';

interface BoardProps {
  level: LevelData;
  onSuccess: () => void;
  onFail: () => void;
}

export const Board: React.FC<BoardProps> = ({ level, onSuccess, onFail }) => {
  const { path, addCellToPath, status, setStatus, decreaseAttempt, resetPath } = useGameStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Use a ref to access latest path in touch move event without triggering re-binds
  const pathRef = useRef(path);
  const statusRef = useRef(status);
  
  useEffect(() => {
    pathRef.current = path;
    statusRef.current = status;
  }, [path, status]);

  // Calculate cell size based on screen width and level grid
  const [cellSize, setCellSize] = useState(50);

  useEffect(() => {
    const calculateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 500); // max width 500px, 20px padding each side
      const size = Math.floor(maxWidth / level.width) - 8; // subtract margin
      setCellSize(size);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [level.width]);

  useEffect(() => {
    // Play spawn sound when level loads
    audioManager.playSpawnSound();
  }, [level.id]);

  const handlePointerDown = (e: React.PointerEvent, x: number, y: number) => {
    if (status !== 'playing') return;
    
    // Only allow starting from the last cell in path (which initially is startCell)
    const currentCell = path[path.length - 1];
    if (currentCell.x === x && currentCell.y === y) {
      setIsDrawing(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const tryMoveTo = useCallback((x: number, y: number) => {
    if (!isDrawing || statusRef.current !== 'playing') return;

    const targetCell = { x, y };
    if (isValidMove(targetCell, pathRef.current, level)) {
      addCellToPath(targetCell);
      audioManager.playSwipeSound();
      
      // Check win condition
      const newPath = [...pathRef.current, targetCell];
      if (checkWinCondition(newPath, level)) {
        setIsDrawing(false);
        setStatus('success');
        audioManager.playSuccessSound();
        onSuccess();
      } else if (isDeadEnd(newPath, level)) {
        // Dead end reached
        setIsDrawing(false);
        audioManager.playFailSound();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        
        setTimeout(() => {
          decreaseAttempt();
          resetPath();
          // If attempts reach 0, status will be set to 'failed' by decreaseAttempt
          if (useGameStore.getState().attemptsLeft === 0) {
            onFail();
          }
        }, 500);
      }
    } else if (isWalkable(targetCell, level) && !isCellInPath(targetCell, pathRef.current)) {
      // Trying to move to a valid cell but not adjacent -> ignore or show error
    }
  }, [isDrawing, level, addCellToPath, onSuccess, setStatus]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || status !== 'playing') return;

    // Convert client coordinates to grid coordinates
    const elem = document.elementFromPoint(e.clientX, e.clientY);
    if (elem) {
      const cellElem = elem.closest('[data-x][data-y]');
      if (cellElem) {
        const xAttr = cellElem.getAttribute('data-x');
        const yAttr = cellElem.getAttribute('data-y');
        if (xAttr !== null && yAttr !== null) {
          const x = parseInt(xAttr, 10);
          const y = parseInt(yAttr, 10);
          
          const lastCell = path[path.length - 1];
          if (lastCell.x !== x || lastCell.y !== y) {
            tryMoveTo(x, y);
          }
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Feature: Allow resuming from the last connected cell.
    // Removed the code that instantly triggers onFail() when lifting the finger.
    // The player can now lift their finger, think, and touch the last connected cell to continue.
  };

  // Generate grid
  const grid = [];
  for (let y = 0; y < level.height; y++) {
    const row = [];
    for (let x = 0; x < level.width; x++) {
      const walkable = isWalkable({ x, y }, level);
      const isStart = level.startCell.x === x && level.startCell.y === y;
      const isInPath = isCellInPath({ x, y }, path);
      const isCurrent = path.length > 0 && path[path.length - 1].x === x && path[path.length - 1].y === y;
      
      // Calculate delay for spawn animation based on manhattan distance from start cell
      const distFromStart = Math.abs(x - level.startCell.x) + Math.abs(y - level.startCell.y);
      const spawnDelay = distFromStart * 0.05;

      row.push(
        <div key={`${x}-${y}`} data-x={x} data-y={y} className="touch-none select-none">
          <Cell
            x={x}
            y={y}
            size={cellSize}
            isWalkable={walkable}
            isStart={isStart}
            isInPath={isInPath}
            isCurrent={isCurrent}
            onPointerDown={handlePointerDown}
            onPointerEnter={() => tryMoveTo(x, y)}
            spawnDelay={spawnDelay}
          />
        </div>
      );
    }
    grid.push(
      <div key={y} className="flex flex-row">
        {row}
      </div>
    );
  }

  // Draw lines between path cells
  const renderLines = () => {
    if (path.length < 2) return null;
    
    const cellTotalSize = cellSize + 8; // size + margin (m-1 is 4px * 2)
    const offset = 16 + 4 + (cellSize / 2);
    
    const points = path.map(cell => ({
      x: cell.x * cellTotalSize + offset,
      y: cell.y * cellTotalSize + offset
    }));

    // Build the SVG path string "M x,y L x,y L x,y..."
    const pathString = points.reduce((str, point, index) => {
      return str + (index === 0 ? `M ${point.x} ${point.y} ` : `L ${point.x} ${point.y} `);
    }, "");

    const lastPoint = points[points.length - 1];

    return (
      <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 30 }}>
        {/* Outer dark stroke for border effect (optional, makes it pop) */}
        <motion.path
          d={pathString}
          fill="none"
          stroke="#A5173B" // matching exactly the dark rim of the path in reference
          strokeWidth={cellSize * 0.35} // Thinner to match reference
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-lg"
        />
        {/* Inner main stroke */}
        <motion.path
          d={pathString}
          fill="none"
          stroke="#C8284B" // matching exactly the main color of the path in reference
          strokeWidth={cellSize * 0.28} // Thinner to match reference
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.15 * path.length, ease: "linear" }}
        />
        {/* Success glow animation */}
        {status === 'success' && (
          <motion.path
            d={pathString}
            fill="none"
            stroke="#ffffff"
            strokeWidth={cellSize * 0.15}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </svg>
    );
  };

  return (
    <motion.div 
      ref={boardRef}
      animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={`relative select-none touch-none bg-slate-900/50 p-4 rounded-2xl border ${isShaking ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'border-slate-800'}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 
        Put grid behind the SVG lines visually, 
        but use pointer-events to handle touch on grid 
      */}
      <div className="flex flex-col relative z-10 pointer-events-auto">
        {grid}
      </div>
      {renderLines()}
    </motion.div>
  );
};
