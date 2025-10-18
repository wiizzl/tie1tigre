import { useEffect, useState } from "react";

interface Obstacle {
  id: number;
  x: number;
}

const Land: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <div className="absolute bottom-120px inset-x-0">{children}</div>
      <div className="absolute bottom-0 inset-x-0 h-120px bg-black" />
    </div>
  );
};

export default function Game() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [nextId, setNextId] = useState(0);
  const [gameSpeed] = useState(5); // pixels per frame

  const [isJumping, setIsJumping] = useState(false);
  const [canJump, setCanJump] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " && !isJumping && canJump) {
        setIsJumping(true);
        setCanJump(false);

        setTimeout(() => {
          setIsJumping(false);
          setTimeout(() => {
            setCanJump(true);
          }, 300);
        }, 500);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isJumping, canJump]);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setObstacles((prev) => [...prev, { id: nextId, x: window.innerWidth }]);
      setNextId((id) => id + 1);
    }, 2000);

    return () => clearInterval(spawnInterval);
  }, [nextId]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setObstacles(
        (prev) =>
          prev
            .map((obs) => ({ ...obs, x: obs.x - gameSpeed }))
            .filter((obs) => obs.x > -100) // remove obstacles off-screen
      );
    }, 16);

    return () => clearInterval(moveInterval);
  }, [gameSpeed]);

  return (
    <Land>
      <div
        className={`absolute w-100px left-5 transition-all duration-500 ${
          isJumping ? "bottom-200px" : "bottom-0"
        }`}
      >
        <img src="/tigre.png" alt="Le tigre" />
      </div>

      {obstacles.map((obstacle) => (
        <div
          key={obstacle.id}
          className="absolute bottom-0 w-50px h-50px bg-red-500"
          style={{ left: `${obstacle.x}px` }}
        />
      ))}
    </Land>
  );
}
