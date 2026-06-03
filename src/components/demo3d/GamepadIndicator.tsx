import { Gamepad2 } from "lucide-react";

export const GamepadIndicator = ({
  connected,
  id,
}: {
  connected: boolean;
  id: string | null;
}) => {
  if (!connected) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 border shadow text-xs">
      <Gamepad2 className="w-4 h-4 text-primary" />
      <span className="truncate max-w-[180px]">{id ?? "Gamepad"} connesso</span>
    </div>
  );
};
