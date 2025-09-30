import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Info, Clock } from "lucide-react";

interface LogEntry {
  message: string;
  type: "neutral" | "profit" | "loss";
  timestamp: Date;
}

interface GameLogProps {
  entries: LogEntry[];
}

const getLogIcon = (type: string) => {
  switch (type) {
    case "profit":
      return <TrendingUp className="w-3 h-3" />;
    case "loss":
      return <TrendingDown className="w-3 h-3" />;
    default:
      return <Info className="w-3 h-3" />;
  }
};

const getLogColor = (type: string) => {
  switch (type) {
    case "profit":
      return "text-tile-profit";
    case "loss":
      return "text-tile-loss";
    default:
      return "text-muted-foreground";
  }
};

const getLogBadgeVariant = (type: string) => {
  switch (type) {
    case "profit":
      return "default";
    case "loss":
      return "destructive";
    default:
      return "secondary";
  }
};

export const GameLog = ({ entries }: GameLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Game Log
          <Badge variant="outline" className="ml-auto text-xs">
            {entries.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48" ref={scrollRef}>
          <div className="space-y-2">
            {entries.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No game events yet. Start playing to see activity!
              </div>
            ) : (
              entries.map((entry, index) => (
                <div
                  key={index}
                  className={`
                    flex items-start gap-2 p-2 rounded-lg text-xs
                    bg-muted/20 border-l-2
                    ${entry.type === 'profit' ? 'border-l-tile-profit' : 
                      entry.type === 'loss' ? 'border-l-tile-loss' : 
                      'border-l-muted-foreground'}
                  `}
                >
                  <div className={`mt-0.5 ${getLogColor(entry.type)}`}>
                    {getLogIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getLogBadgeVariant(entry.type)} className="text-xs">
                        {entry.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`${getLogColor(entry.type)} leading-tight break-words`}>
                      {entry.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Log Footer */}
        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span>🔒 All transactions are FHE encrypted</span>
            <span>Real-time updates</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};