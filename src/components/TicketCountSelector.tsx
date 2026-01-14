import { Minus, Plus, Users } from "lucide-react";

interface TicketCountSelectorProps {
  count: number;
  maxCount: number;
  onChange: (count: number) => void;
}

const TicketCountSelector = ({ count, maxCount, onChange }: TicketCountSelectorProps) => {
  const increment = () => {
    if (count < maxCount) {
      onChange(count + 1);
    }
  };

  const decrement = () => {
    if (count > 1) {
      onChange(count - 1);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">Tickets:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={decrement}
          disabled={count <= 1}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all
            ${count <= 1 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-primary/20 text-primary hover:bg-primary/30"
            }
          `}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-bold text-foreground text-lg">
          {count}
        </span>
        
        <button
          onClick={increment}
          disabled={count >= maxCount}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all
            ${count >= maxCount 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-primary/20 text-primary hover:bg-primary/30"
            }
          `}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TicketCountSelector;
