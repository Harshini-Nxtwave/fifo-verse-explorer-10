
import React from 'react';

// This component is no longer used for FIFO functionality
// It's kept as a placeholder to maintain imports in other files
const FifoQueue: React.FC<{
  items: Array<{ id: string; value: string | number; color: string; isNew?: boolean; isLeaving?: boolean }>
}> = () => {
  return null;
};

export default FifoQueue;
