import { Cell, LevelData } from '../types/game';

export const isAdjacent = (c1: Cell, c2: Cell) => {
  const dx = Math.abs(c1.x - c2.x);
  const dy = Math.abs(c1.y - c2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

export const isCellInPath = (cell: Cell, path: Cell[]) => {
  return path.some(p => p.x === cell.x && p.y === cell.y);
};

export const isWalkable = (cell: Cell, level: LevelData) => {
  return level.walkableCells.some(c => c.x === cell.x && c.y === cell.y);
};

export const checkWinCondition = (path: Cell[], level: LevelData) => {
  return path.length === level.walkableCells.length;
};

export const isValidMove = (targetCell: Cell, path: Cell[], level: LevelData) => {
  if (path.length === 0) return false;
  
  const currentCell = path[path.length - 1];
  
  if (!isWalkable(targetCell, level)) return false;
  if (isCellInPath(targetCell, path)) return false;
  if (!isAdjacent(currentCell, targetCell)) return false;
  
  return true;
};

export const isDeadEnd = (path: Cell[], level: LevelData) => {
  if (path.length === level.walkableCells.length) return false;
  if (path.length === 0) return false;

  const currentCell = path[path.length - 1];
  const dx = [0, 0, -1, 1];
  const dy = [-1, 1, 0, 0];

  for (let i = 0; i < 4; i++) {
    const targetCell = { x: currentCell.x + dx[i], y: currentCell.y + dy[i] };
    if (isValidMove(targetCell, path, level)) {
      return false;
    }
  }
  return true;
};

// Helper function to find a valid solution path using DFS
export const solveLevel = (level: LevelData, startPath: Cell[] = []): Cell[] | null => {
  const cellSet = new Set(level.walkableCells.map(c => `${c.x},${c.y}`));
  let iterations = 0;
  const MAX_ITERATIONS = 500000;

  // Use current path as base, or just the start cell
  const baseSequence = startPath.length > 0 ? [...startPath] : [level.startCell];
  
  const visited = new Set(baseSequence.map(c => `${c.x},${c.y}`));

  const solveDFS = (currentPath: Cell[]): Cell[] | null => {
    iterations++;
    if (iterations > MAX_ITERATIONS) return null;

    if (currentPath.length === level.walkableCells.length) {
      return currentPath;
    }

    const currentCell = currentPath[currentPath.length - 1];
    const dx = [0, 0, -1, 1];
    const dy = [-1, 1, 0, 0];

    // Simple heuristic: Warnsdorff's Rule equivalent (visit neighbors with fewest unvisited neighbors first)
    // Helps speed up Hamiltonian path finding
    const validNeighbors = [];
    for (let i = 0; i < 4; i++) {
      const nx = currentCell.x + dx[i];
      const ny = currentCell.y + dy[i];
      const nKey = `${nx},${ny}`;

      if (cellSet.has(nKey) && !visited.has(nKey)) {
        // Count unvisited neighbors of this neighbor
        let unvisitedCount = 0;
        for (let j = 0; j < 4; j++) {
          const nnx = nx + dx[j];
          const nny = ny + dy[j];
          const nnKey = `${nnx},${nny}`;
          if (cellSet.has(nnKey) && !visited.has(nnKey)) {
            unvisitedCount++;
          }
        }
        validNeighbors.push({ cell: { x: nx, y: ny }, key: nKey, unvisitedCount });
      }
    }

    // Sort neighbors by fewest unvisited options first
    validNeighbors.sort((a, b) => a.unvisitedCount - b.unvisitedCount);

    for (const neighbor of validNeighbors) {
      visited.add(neighbor.key);
      currentPath.push(neighbor.cell);

      const result = solveDFS(currentPath);
      if (result) return result;

      // Backtrack
      currentPath.pop();
      visited.delete(neighbor.key);
    }

    return null;
  };

  return solveDFS(baseSequence);
};
