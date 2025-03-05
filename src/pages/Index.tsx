
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Scene3D from '@/components/Scene3D';
import ControlPanel from '@/components/ControlPanel';
import FifoExplanation from '@/components/FifoExplanation';

// Queue colors for visualization
const QUEUE_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

const Index = () => {
  const [queueItems, setQueueItems] = useState<Array<{
    id: string;
    value: string | number;
    color: string;
    isNew?: boolean;
    isLeaving?: boolean;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to enqueue a new item
  const handleEnqueue = (value: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Create a new item with a random color from our palette
    const newItem = {
      id: Date.now().toString(),
      value,
      color: QUEUE_COLORS[Math.floor(Math.random() * QUEUE_COLORS.length)],
      isNew: true
    };
    
    setQueueItems(prev => [...prev, newItem]);
    
    // Show toast notification
    toast.success(`Enqueued: ${value}`, {
      description: 'Item added to the back of the queue',
    });
    
    // Remove the "isNew" flag after animation completes
    setTimeout(() => {
      setQueueItems(prev => 
        prev.map(item => 
          item.id === newItem.id ? { ...item, isNew: false } : item
        )
      );
      setIsProcessing(false);
    }, 1000);
  };

  // Function to dequeue an item
  const handleDequeue = () => {
    if (isProcessing || queueItems.length === 0) return;
    
    setIsProcessing(true);
    
    // Mark the first item as leaving (for animation)
    setQueueItems(prev => 
      prev.map((item, index) => 
        index === 0 ? { ...item, isLeaving: true } : item
      )
    );
    
    // Show toast notification for the dequeued item
    const dequeuedItem = queueItems[0];
    toast.info(`Dequeued: ${dequeuedItem.value}`, {
      description: 'Item removed from the front of the queue',
    });
    
    // Actually remove the item after animation completes
    setTimeout(() => {
      setQueueItems(prev => prev.slice(1));
      setIsProcessing(false);
    }, 1000);
  };

  // Add some initial example items
  useEffect(() => {
    const initialItems = [
      { id: '1', value: 'A', color: QUEUE_COLORS[0] },
      { id: '2', value: 'B', color: QUEUE_COLORS[1] },
      { id: '3', value: 'C', color: QUEUE_COLORS[2] },
    ];
    setQueueItems(initialItems);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <motion.header 
        className="py-6 px-6 md:px-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gradient">FIFO Queue Visualizer</h1>
        <p className="mt-2 text-lg text-gray-600">An interactive 3D visualization of the First-In-First-Out concept</p>
      </motion.header>
      
      <div className="flex-1 container mx-auto px-4 pb-10 flex flex-col lg:flex-row gap-6 items-start">
        <motion.div 
          className="w-full lg:w-2/3 h-[500px] rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Scene3D queueItems={queueItems} />
        </motion.div>
        
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ControlPanel 
              enqueue={handleEnqueue} 
              dequeue={handleDequeue} 
              queueSize={queueItems.length}
              isProcessing={isProcessing}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FifoExplanation />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
