import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { currentScoreAtom, highScoreAtom, isGameOverAtom } from "../store/game";

interface Obstacle {
  id: number;
  x: number;
}

const Land: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-screen">
      <img src="/wallpaper.jpg" alt="Image de fond" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-120px inset-x-0">{children}</div>
      <div className="absolute bottom-0 inset-x-0 h-120px bg-black/50" />
    </div>
  );
};

export default function Game() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [nextId, setNextId] = useState(0);
  const [gameSpeed] = useState(5); // pixels per frame

  const [isJumping, setIsJumping] = useState(false);
  const [canJump, setCanJump] = useState(true);
  const [tigerY, setTigerY] = useState(0); // Actual Y position for collision

  const [highScore, setHighScore] = useAtom(highScoreAtom);
  const [currentScore, setCurrentScore] = useAtom(currentScoreAtom);
  const [isGameOver, setIsGameOver] = useAtom(isGameOverAtom);

  const tigerRef = useRef<HTMLDivElement>(null);
  const tigerYRef = useRef(0); // Use ref for collision detection to avoid effect re-runs

  // Tiger hitbox constants
  const TIGER_X = 20; // left position + some margin
  const TIGER_WIDTH = 80;
  const OBSTACLE_WIDTH = 20; // Reduced from 50
  const OBSTACLE_HEIGHT = 40; // Reduced from 50

  // Collision detection
  const checkCollision = (obstacleX: number, tigerBottom: number) => {
    const tigerRight = TIGER_X + TIGER_WIDTH;

    const obstacleRight = obstacleX + OBSTACLE_WIDTH;
    const obstacleTop = OBSTACLE_HEIGHT;

    // Check if boxes overlap horizontally
    const horizontalOverlap = TIGER_X < obstacleRight && tigerRight > obstacleX;

    // Check if tiger is low enough to hit the obstacle
    // When tiger is on ground (tigerBottom = 0), it collides
    // When tiger is jumping (tigerBottom = 200), it's above the obstacle (50px high)
    const verticalCollision = tigerBottom < obstacleTop;

    return horizontalOverlap && verticalCollision;
  };

  // Reset game
  const resetGame = () => {
    setObstacles([]);
    setNextId(0);
    setCurrentScore(0);
    setIsGameOver(false);
    setIsJumping(false);
    setCanJump(true);
    setTigerY(0);
    tigerYRef.current = 0;
  };

  // Handle jump
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver && event.key === " ") {
        resetGame();
        return;
      }

      if (event.key === " " && !isJumping && canJump && !isGameOver) {
        setIsJumping(true);
        new Audio("/audio/jump.mp3").play();
        setCanJump(false);

        // Animate jump with smooth interpolation
        let jumpProgress = 0;
        const jumpDuration = 700; // Increased significantly for longer airtime
        const jumpHeight = 120; // High enough to clear obstacles
        const startTime = Date.now();

        const animateJump = () => {
          const elapsed = Date.now() - startTime;
          jumpProgress = Math.min(elapsed / jumpDuration, 1);

          // Use sine wave for smooth jump arc
          const currentHeight = Math.sin(jumpProgress * Math.PI) * jumpHeight;
          setTigerY(currentHeight);
          tigerYRef.current = currentHeight; // Update ref for collision detection

          if (jumpProgress < 1) {
            requestAnimationFrame(animateJump);
          } else {
            setIsJumping(false);
            setTigerY(0);
            tigerYRef.current = 0;
          }
        };

        requestAnimationFrame(animateJump);

        setTimeout(() => {
          setCanJump(true);
        }, 700); // Increased to match longer jump duration
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isJumping, canJump, isGameOver]);

  // Spawn obstacles
  useEffect(() => {
    if (isGameOver) return;

    let currentId = nextId;
    let lastSpawnTime = Date.now();

    const spawnInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSpawn = now - lastSpawnTime;

      // Random delay between 2000ms and 3500ms
      const requiredDelay = 2000 + Math.random() * 1500;

      if (timeSinceLastSpawn < requiredDelay) {
        return; // Not time to spawn yet
      }

      setObstacles((prev) => {
        // Check if last obstacle is far enough away
        const lastObstacle = prev[prev.length - 1];
        if (lastObstacle && lastObstacle.x > window.innerWidth - 400) {
          return prev; // Too soon, don't spawn
        }

        const newObstacle = { id: currentId, x: window.innerWidth };
        currentId++;
        lastSpawnTime = now;
        return [...prev, newObstacle];
      });
    }, 100); // Check every 100ms instead of recursive setTimeout

    return () => {
      clearInterval(spawnInterval);
      setNextId(currentId);
    };
  }, [isGameOver, nextId]);

  // Move obstacles and check collisions
  useEffect(() => {
    if (isGameOver) return;

    const moveInterval = setInterval(() => {
      setObstacles((prev) => {
        const updatedObstacles = prev.map((obs) => ({ ...obs, x: obs.x - gameSpeed })).filter((obs) => obs.x > -100); // remove obstacles off-screen

        // Check collisions using ref to avoid effect re-runs
        for (const obstacle of updatedObstacles) {
          if (checkCollision(obstacle.x, tigerYRef.current)) {
            setIsGameOver(true);
            if (currentScore > highScore) {
              new Audio("/audio/win.mp3").play();
              setHighScore(currentScore);
            } else {
              new Audio("/audio/lose.mp3").play();
            }
            return prev; // Stop updating obstacles
          }
        }

        return updatedObstacles;
      });
    }, 16);

    return () => clearInterval(moveInterval);
  }, [gameSpeed, isGameOver, currentScore, highScore]);

  // Increase score over time
  useEffect(() => {
    if (isGameOver) return;

    const scoreInterval = setInterval(() => {
      setCurrentScore((prev) => prev + 1);
    }, 100); // Increase score every 100ms

    return () => clearInterval(scoreInterval);
  }, [isGameOver]);

  return (
    <Land>
      {/* Score Display */}
      <div className="absolute top-20px right-20px text-white text-2xl font-mono z-10">
        <div>Score: {currentScore}</div>
        <div className="text-gray-400">High Score: {highScore}</div>
      </div>

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl mb-2">Score: {currentScore}</p>
            <p className="text-xl mb-6">High Score: {highScore}</p>
            <p className="text-gray-300">Press SPACE to restart</p>
          </div>
        </div>
      )}

      {/* Tiger (player) */}
      <div ref={tigerRef} className="absolute left-5" style={{ bottom: `${tigerY}px` }}>
        <img src={`/tigre/${Math.floor((currentScore / 5) % 4) + 1}.png`} alt="Le tigre" width={100} />
      </div>

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <div key={obstacle.id} className="absolute bottom-0 size-60px" style={{ left: `${obstacle.x}px` }}>
          <img src="/psg.png" alt="Obstacle" />
        </div>
      ))}
    </Land>
  );
}
