
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ControlPanelProps {
  enqueue: (value: string) => void;
  dequeue: () => void;
  queueSize: number;
  isProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ enqueue, dequeue, queueSize, isProcessing }) => {
  const [inputValue, setInputValue] = useState<string>('');
  
  const handleEnqueue = () => {
    if (inputValue.trim()) {
      enqueue(inputValue);
      setInputValue('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEnqueue();
    }
  };
  
  return (
    <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold">FIFO Queue Controller</CardTitle>
            <CardDescription>Add and remove elements to visualize the queue</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/10">
            Size: {queueSize}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter value to add to queue"
              className="transition-all duration-300"
              disabled={isProcessing}
            />
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button 
                onClick={handleEnqueue} 
                className="bg-fifo-highlight hover:bg-fifo-highlight/90 transition-all duration-300"
                disabled={isProcessing || !inputValue.trim()}
              >
                Enqueue
              </Button>
            </motion.div>
          </div>
          
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button 
              onClick={dequeue} 
              className="w-full bg-fifo-tertiary hover:bg-fifo-tertiary/90 transition-all duration-300"
              disabled={isProcessing || queueSize === 0}
            >
              Dequeue
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
