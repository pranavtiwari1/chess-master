import { useState } from 'react';
import { ChessBoard } from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Difficulty } from '@/lib/chessAI';
import { toast } from 'sonner';

const Index = () => {
  const [gameMode, setGameMode] = useState<'bot' | 'player' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameKey, setGameKey] = useState(0);

  const handleGameEnd = (result: string) => {
    toast(result, {
      duration: 5000,
    });
  };

  const startNewGame = (mode: 'bot' | 'player') => {
    setGameMode(mode);
    setGameKey(prev => prev + 1);
  };

  const resetGame = () => {
    setGameMode(null);
    setGameKey(prev => prev + 1);
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <Card className="p-10 max-w-3xl w-full space-y-8 shadow-2xl border-2 border-primary/20">
          <div className="text-center space-y-3">
            <h1 className="text-6xl sm:text-7xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent drop-shadow-lg">
              ♔ Chess Master ♚
            </h1>
            <p className="text-muted-foreground text-xl font-medium tracking-wide">Choose your game mode</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <h2 className="text-2xl font-bold text-foreground">Play vs Bot</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={() => {
                    setDifficulty('easy');
                    startNewGame('bot');
                  }}
                  variant="outline"
                  className="h-28 text-lg hover:scale-105 transition-all duration-300 hover:shadow-xl border-2"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">😊</span>
                    <span className="font-bold text-lg">Easy</span>
                    <span className="text-xs text-muted-foreground">Beginner</span>
                  </div>
                </Button>
                <Button
                  onClick={() => {
                    setDifficulty('medium');
                    startNewGame('bot');
                  }}
                  variant="outline"
                  className="h-28 text-lg hover:scale-105 transition-all duration-300 hover:shadow-xl border-2"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🤔</span>
                    <span className="font-bold text-lg">Medium</span>
                    <span className="text-xs text-muted-foreground">Intermediate</span>
                  </div>
                </Button>
                <Button
                  onClick={() => {
                    setDifficulty('hard');
                    startNewGame('bot');
                  }}
                  variant="outline"
                  className="h-28 text-lg hover:scale-105 transition-all duration-300 hover:shadow-xl border-2"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">😤</span>
                    <span className="font-bold text-lg">Hard</span>
                    <span className="text-xs text-muted-foreground">Advanced</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-border">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👥</span>
                <h2 className="text-2xl font-bold text-foreground">Play vs Player</h2>
              </div>
              <Button
                onClick={() => startNewGame('player')}
                variant="default"
                className="w-full h-20 text-lg hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-xl">Local Multiplayer</span>
                  <span className="text-sm opacity-90">Two players on same device</span>
                </div>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-primary/20">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              ♔ Chess Master ♚
            </h1>
            <p className="text-muted-foreground font-medium text-lg mt-1">
              {gameMode === 'bot' ? `Playing vs Bot (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})` : 'Local Multiplayer'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setGameKey(prev => prev + 1)} 
              variant="outline"
              className="font-bold hover:scale-105 transition-all duration-300"
            >
              🔄 New Game
            </Button>
            <Button 
              onClick={resetGame} 
              variant="secondary"
              className="font-bold hover:scale-105 transition-all duration-300"
            >
              🏠 Main Menu
            </Button>
          </div>
        </div>

        <ChessBoard
          key={gameKey}
          mode={gameMode}
          difficulty={difficulty}
          onGameEnd={handleGameEnd}
        />
      </div>
    </div>
  );
};

export default Index;
