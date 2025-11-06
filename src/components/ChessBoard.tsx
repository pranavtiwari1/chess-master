import { useState, useEffect } from 'react';
import {
  Board,
  Position,
  getValidMoves,
  copyBoard,
  isCheckmate,
  isStalemate,
  getPieceSymbol,
  INITIAL_BOARD,
  PieceColor,
} from '@/lib/chess';
import { getBestMove, Difficulty } from '@/lib/chessAI';
import { cn } from '@/lib/utils';

interface ChessBoardProps {
  mode: 'bot' | 'player';
  difficulty: Difficulty;
  onGameEnd: (result: string) => void;
}

export const ChessBoard = ({ mode, difficulty, onGameEnd }: ChessBoardProps) => {
  const [board, setBoard] = useState<Board>(copyBoard(INITIAL_BOARD));
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    checkGameEnd();
  }, [board, currentPlayer]);

  useEffect(() => {
    if (mode === 'bot' && currentPlayer === 'black' && !isThinking) {
      makeBotMove();
    }
  }, [currentPlayer, mode, isThinking, board]);

  const checkGameEnd = () => {
    if (isCheckmate(board, currentPlayer)) {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      onGameEnd(`Checkmate! ${winner} wins!`);
    } else if (isStalemate(board, currentPlayer)) {
      onGameEnd('Stalemate! Game is a draw.');
    }
  };

  const makeBotMove = async () => {
    setIsThinking(true);
    
    // Add a small delay to make it feel more natural
    setTimeout(() => {
      const move = getBestMove(board, 'black', difficulty);
      
      if (move) {
        const newBoard = copyBoard(board);
        const piece = newBoard[move.from.row][move.from.col];
        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;

        setBoard(newBoard);
        addToHistory(move.from, move.to, piece?.type || '');
        setCurrentPlayer('white');
      }
      
      setIsThinking(false);
    }, 500);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (isThinking) return;
    if (mode === 'bot' && currentPlayer === 'black') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const isValidMove = validMoves.some(
        move => move.row === row && move.col === col
      );

      if (isValidMove) {
        const newBoard = copyBoard(board);
        const movingPiece = newBoard[selectedSquare.row][selectedSquare.col];
        newBoard[row][col] = movingPiece;
        newBoard[selectedSquare.row][selectedSquare.col] = null;

        setBoard(newBoard);
        addToHistory(selectedSquare, { row, col }, movingPiece?.type || '');
        setSelectedSquare(null);
        setValidMoves([]);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      } else if (piece && piece.color === currentPlayer) {
        setSelectedSquare({ row, col });
        setValidMoves(getValidMoves(board, { row, col }));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece && piece.color === currentPlayer) {
      setSelectedSquare({ row, col });
      setValidMoves(getValidMoves(board, { row, col }));
    }
  };

  const addToHistory = (from: Position, to: Position, pieceType: string) => {
    const fromSquare = `${String.fromCharCode(97 + from.col)}${8 - from.row}`;
    const toSquare = `${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    const move = `${pieceType} ${fromSquare}-${toSquare}`;
    setMoveHistory(prev => [...prev, move]);
  };

  const isHighlighted = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center px-4">
      <div className="relative">
        {isThinking && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-10 flex items-center justify-center rounded-2xl">
            <div className="bg-primary/10 px-6 py-3 rounded-lg border-2 border-primary/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-foreground font-bold text-lg tracking-wide">Bot is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          {/* Coordinate labels */}
          <div className="absolute -left-8 top-0 h-full flex flex-col justify-around text-xs font-semibold text-muted-foreground">
            {[8, 7, 6, 5, 4, 3, 2, 1].map(num => (
              <div key={num} className="h-16 sm:h-20 flex items-center">{num}</div>
            ))}
          </div>
          <div className="absolute -bottom-6 left-0 w-full flex justify-around text-xs font-semibold text-muted-foreground">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
              <div key={letter} className="w-16 sm:w-20 flex justify-center">{letter}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-8 gap-0 border-8 border-primary/20 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isLight = (rowIndex + colIndex) % 2 === 0;
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className={cn(
                      'w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-4xl sm:text-5xl cursor-pointer transition-all duration-300',
                      isLight ? 'bg-chess-light' : 'bg-chess-dark',
                      isSelected(rowIndex, colIndex) && 'bg-chess-selected ring-4 ring-chess-selected/60 scale-95',
                      isHighlighted(rowIndex, colIndex) && 'bg-chess-highlight ring-4 ring-chess-highlight/80',
                      'hover:brightness-110 hover:scale-105 active:scale-95',
                      piece && 'hover:shadow-lg'
                    )}
                  >
                    {piece && (
                      <span className="select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform duration-200 hover:scale-110">
                        {getPieceSymbol(piece)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="mt-8 text-center bg-card/50 backdrop-blur-sm rounded-xl p-4 border-2 border-primary/20 shadow-lg">
          <p className="text-xl font-bold text-foreground flex items-center justify-center gap-3">
            <span className="text-muted-foreground">Current Turn:</span>
            <span className={cn(
              "capitalize px-4 py-1 rounded-lg font-extrabold text-xl tracking-wider",
              currentPlayer === 'white' 
                ? 'bg-white text-black border-2 border-gray-300' 
                : 'bg-black text-white border-2 border-gray-600'
            )}>
              {currentPlayer}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-full lg:w-72 max-h-[500px] overflow-y-auto border-2 border-primary/20">
        <h3 className="text-2xl font-bold mb-4 text-card-foreground flex items-center gap-2 pb-3 border-b-2 border-primary/20">
          <span className="text-primary">📋</span>
          Move History
        </h3>
        {moveHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm italic">No moves yet</p>
            <p className="text-muted-foreground text-xs mt-2">Make your first move!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {moveHistory.map((move, index) => (
              <div 
                key={index} 
                className={cn(
                  "text-sm text-card-foreground py-2 px-3 rounded-lg transition-all duration-200",
                  index % 2 === 0 
                    ? 'bg-primary/10 border-l-4 border-primary/40' 
                    : 'bg-secondary/30 border-l-4 border-secondary/60',
                  index === moveHistory.length - 1 && 'ring-2 ring-primary/30 font-semibold'
                )}
              >
                <span className="font-bold text-primary/80">{index + 1}.</span> {move}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
