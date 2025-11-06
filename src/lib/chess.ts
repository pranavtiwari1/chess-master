// Chess game logic

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotion?: PieceType;
}

export type Board = (Piece | null)[][];

export const INITIAL_BOARD: Board = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

export const getPieceSymbol = (piece: Piece): string => {
  const symbols: Record<PieceColor, Record<PieceType, string>> = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
  };
  return symbols[piece.color][piece.type];
};

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

export const copyBoard = (board: Board): Board => {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
};

export const getValidMoves = (
  board: Board,
  from: Position,
  lastMove?: Move
): Position[] => {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Position[] = [];

  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, from, piece.color, lastMove));
      break;
    case 'knight':
      moves.push(...getKnightMoves(board, from, piece.color));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(board, from, piece.color));
      break;
    case 'rook':
      moves.push(...getRookMoves(board, from, piece.color));
      break;
    case 'queen':
      moves.push(...getQueenMoves(board, from, piece.color));
      break;
    case 'king':
      moves.push(...getKingMoves(board, from, piece.color));
      break;
  }

  return moves.filter(to => !wouldBeInCheck(board, from, to, piece.color));
};

const getPawnMoves = (
  board: Board,
  from: Position,
  color: PieceColor,
  lastMove?: Move
): Position[] => {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // Forward move
  const forward = { row: from.row + direction, col: from.col };
  if (isValidPosition(forward) && !board[forward.row][forward.col]) {
    moves.push(forward);

    // Double move from start
    if (from.row === startRow) {
      const doubleForward = { row: from.row + 2 * direction, col: from.col };
      if (!board[doubleForward.row][doubleForward.col]) {
        moves.push(doubleForward);
      }
    }
  }

  // Captures
  [-1, 1].forEach(colOffset => {
    const capture = { row: from.row + direction, col: from.col + colOffset };
    if (isValidPosition(capture)) {
      const target = board[capture.row][capture.col];
      if (target && target.color !== color) {
        moves.push(capture);
      }

      // En passant
      if (
        lastMove &&
        lastMove.piece.type === 'pawn' &&
        Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
        lastMove.to.row === from.row &&
        lastMove.to.col === capture.col
      ) {
        moves.push(capture);
      }
    }
  });

  return moves;
};

const getKnightMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  offsets.forEach(([rowOffset, colOffset]) => {
    const to = { row: from.row + rowOffset, col: from.col + colOffset };
    if (isValidPosition(to)) {
      const target = board[to.row][to.col];
      if (!target || target.color !== color) {
        moves.push(to);
      }
    }
  });

  return moves;
};

const getBishopMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  return getDirectionalMoves(board, from, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
};

const getRookMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  return getDirectionalMoves(board, from, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
};

const getQueenMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  return getDirectionalMoves(
    board,
    from,
    color,
    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  );
};

const getKingMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  offsets.forEach(([rowOffset, colOffset]) => {
    const to = { row: from.row + rowOffset, col: from.col + colOffset };
    if (isValidPosition(to)) {
      const target = board[to.row][to.col];
      if (!target || target.color !== color) {
        moves.push(to);
      }
    }
  });

  return moves;
};

const getDirectionalMoves = (
  board: Board,
  from: Position,
  color: PieceColor,
  directions: number[][]
): Position[] => {
  const moves: Position[] = [];

  directions.forEach(([rowDir, colDir]) => {
    let row = from.row + rowDir;
    let col = from.col + colDir;

    while (isValidPosition({ row, col })) {
      const target = board[row][col];
      if (!target) {
        moves.push({ row, col });
      } else {
        if (target.color !== color) {
          moves.push({ row, col });
        }
        break;
      }
      row += rowDir;
      col += colDir;
    }
  });

  return moves;
};

const wouldBeInCheck = (
  board: Board,
  from: Position,
  to: Position,
  color: PieceColor
): boolean => {
  const testBoard = copyBoard(board);
  testBoard[to.row][to.col] = testBoard[from.row][from.col];
  testBoard[from.row][from.col] = null;
  return isInCheck(testBoard, color);
};

export const isInCheck = (board: Board, color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === 'white' ? 'black' : 'white';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getValidMovesWithoutCheckTest(board, { row, col });
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true;
        }
      }
    }
  }

  return false;
};

const getValidMovesWithoutCheckTest = (board: Board, from: Position): Position[] => {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, from, piece.color);
    case 'knight':
      return getKnightMoves(board, from, piece.color);
    case 'bishop':
      return getBishopMoves(board, from, piece.color);
    case 'rook':
      return getRookMoves(board, from, piece.color);
    case 'queen':
      return getQueenMoves(board, from, piece.color);
    case 'king':
      return getKingMoves(board, from, piece.color);
    default:
      return [];
  }
};

const findKing = (board: Board, color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isCheckmate = (board: Board, color: PieceColor): boolean => {
  if (!isInCheck(board, color)) return false;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col });
        if (moves.length > 0) return false;
      }
    }
  }

  return true;
};

export const isStalemate = (board: Board, color: PieceColor): boolean => {
  if (isInCheck(board, color)) return false;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col });
        if (moves.length > 0) return false;
      }
    }
  }

  return true;
};
