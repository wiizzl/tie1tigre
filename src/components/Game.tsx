const Land: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <div className="absolute bottom-120px inset-x-0">{children}</div>
      <div className="absolute bottom-0 inset-x-0 h-120px bg-black" />
    </div>
  );
};

export default function Game() {
  return (
    <Land>
      <div className="absolute border size-100px bottom-0 left-5">
        <img src="/tigre.png" alt="Le tigre" width={150} height={100} />
      </div>
    </Land>
  );
}
