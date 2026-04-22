export function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

import { LevelData } from '../types/game';

export const getDailyLevel = (dateStr: string): LevelData => {
  let seed = 0;
  for(let i = 0; i < dateStr.length; i++) {
    seed = Math.imul(31, seed) + dateStr.charCodeAt(i) | 0;
  }
  const rand = mulberry32(seed);

  const width = 6;
  const height = 6;
  const targetLength = 32; // Very hard: 32 out of 36 cells
  
  let path: {x:number, y:number}[] = [];
  
  // Deterministic backtracker to find a path of exactly targetLength
  while(path.length < targetLength) {
      const startX = Math.floor(rand() * width);
      const startY = Math.floor(rand() * height);
      
      const visited = new Set<string>();
      path = [{x: startX, y: startY}];
      visited.add(`${startX},${startY}`);
      
      const dfs = (current: {x:number, y:number}): boolean => {
          if (path.length === targetLength) return true;
          
          const neighbors = [
              {x: current.x, y: current.y - 1},
              {x: current.x, y: current.y + 1},
              {x: current.x - 1, y: current.y},
              {x: current.x + 1, y: current.y}
          ];
          
          // Shuffle neighbors deterministically
          for (let i = neighbors.length - 1; i > 0; i--) {
              const j = Math.floor(rand() * (i + 1));
              [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
          }
          
          for (const n of neighbors) {
              if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                  const key = `${n.x},${n.y}`;
                  if (!visited.has(key)) {
                      visited.add(key);
                      path.push(n);
                      if (dfs(n)) return true;
                      path.pop();
                      visited.delete(key);
                  }
              }
          }
          return false;
      };
      
      dfs({x: startX, y: startY});
  }
  
  return {
      id: 9999,
      mode: 'daily',
      width,
      height,
      startCell: path[0],
      walkableCells: path,
      maxAttempts: 3,
      difficulty: 10,
      timeLimit: 60
  };
};