import {
  Board,
  PieceColor,
  Position,
  copyBoard,
  getValidMoves,
  isCheckmate,
  Piece,
} from './chess';

export type Difficulty = 'easy' | 'medium' | 'hard';

const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

const evaluateBoard = (board: Board, color: PieceColor): number => {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        const positionBonus = getPositionBonus(piece, row, col);
        const total = value + positionBonus;
        
        if (piece.color === color) {
          score += total;
        } else {
          score -= total;
        }
      }
    }
  }

  return score;
};

const getPositionBonus = (piece: Piece, row: number, col: number): number => {
  const centerBonus = Math.max(0, 3 - Math.abs(3.5 - row) - Math.abs(3.5 - col)) * 10;
  
  if (piece.type === 'pawn') {
    const advancementBonus = piece.color === 'white' ? (6 - row) * 10 : row * 10;
    return advancementBonus;
  }
  
  if (piece.type === 'knight' || piece.type === 'bishop') {
    return centerBonus;
  }
  
  return 0;
};

const getAllPossibleMoves = (board: Board, color: PieceColor): Array<{ from: Position; to: Position }> => {
  const moves: Array<{ from: Position; to: Position }> = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, { row, col });
        validMoves.forEach(to => {
          moves.push({ from: { row, col }, to });
        });
      }
    }
  }

  return moves;
};

const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  color: PieceColor
): number => {
  if (depth === 0) {
    return evaluateBoard(board, color);
  }

  const currentColor = maximizing ? color : (color === 'white' ? 'black' : 'white');
  
  if (isCheckmate(board, currentColor)) {
    return maximizing ? -999999 : 999999;
  }

  const moves = getAllPossibleMoves(board, currentColor);
  
  if (moves.length === 0) {
    return 0; // Stalemate
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, color);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, color);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

const makeMove = (board: Board, from: Position, to: Position): Board => {
  const newBoard = copyBoard(board);
  newBoard[to.row][to.col] = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = null;
  return newBoard;
};

export const getBestMove = (
  board: Board,
  color: PieceColor,
  difficulty: Difficulty
): { from: Position; to: Position } | null => {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const moves = getAllPossibleMoves(board, color);

  if (moves.length === 0) return null;

  // Easy mode: random with slight preference for captures
  if (difficulty === 'easy' && Math.random() < 0.5) {
    const captures = moves.filter(move => board[move.to.row][move.to.col] !== null);
    if (captures.length > 0 && Math.random() < 0.7) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = moves[0];
  let bestValue = -Infinity;

  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to);
    const value = minimax(newBoard, depth - 1, -Infinity, Infinity, false, color);
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
};
