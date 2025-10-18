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
      <div className="absolute border size-100px bottom-0 left-5">
        <img src="/tigre.png" alt="Le tigre" width={150} height={100} />
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
