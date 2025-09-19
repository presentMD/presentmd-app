import { Minus, Equal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MacWindowControlsProps {
  onMinimize: () => void;
  onRestore: () => void;
  onMaximize: () => void;
  position: 'left' | 'right';
}

const MacWindowControls = ({ onMinimize, onRestore, onMaximize, position }: MacWindowControlsProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {/* Red - Minimize */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMinimize}
        className="h-3 w-3 p-0 rounded-full bg-red-500 hover:bg-red-600 border-red-600 border"
        title="Minimize panel"
      >
        <Minus className="h-2 w-2 text-red-900" />
      </Button>
      {/* Orange - Restore */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRestore}
        className="h-3 w-3 p-0 rounded-full bg-orange-500 hover:bg-orange-600 border-orange-600 border"
        title="Equal size panels"
      >
        <Equal className="h-2 w-2 text-orange-900" />
      </Button>
      {/* Green - Maximize */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMaximize}
        className="h-3 w-3 p-0 rounded-full bg-green-500 hover:bg-green-600 border-green-600 border"
        title="Maximize panel"
      >
        <Plus className="h-2 w-2 text-green-900" />
      </Button>
    </div>
  );
};

export default MacWindowControls;