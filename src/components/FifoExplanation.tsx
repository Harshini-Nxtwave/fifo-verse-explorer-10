
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const FifoExplanation: React.FC = () => {
  return (
    <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CardTitle className="text-2xl font-semibold">Understanding FIFO Queues</CardTitle>
          <CardDescription>First In, First Out Data Structure</CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="concept">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="concept" className="flex-1">Concept</TabsTrigger>
            <TabsTrigger value="operations" className="flex-1">Operations</TabsTrigger>
            <TabsTrigger value="applications" className="flex-1">Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="concept" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-medium mb-2">What is a FIFO Queue?</h3>
              <p className="text-muted-foreground">
                A FIFO (First In, First Out) queue is a linear data structure where the first element added is the first one to be removed. This mirrors real-world queues, like people waiting in line.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2">Key Characteristics</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Elements are added at the back (enqueue operation)</li>
                <li>Elements are removed from the front (dequeue operation)</li>
                <li>Elements are processed in the exact order they arrive</li>
                <li>FIFO principle: the oldest request is handled first</li>
              </ul>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="operations" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-medium mb-2">Main Operations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium">Enqueue</h4>
                  <p className="text-sm text-muted-foreground">Adds an element to the back of the queue</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium">Dequeue</h4>
                  <p className="text-sm text-muted-foreground">Removes and returns the element at the front of the queue</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium">Peek/Front</h4>
                  <p className="text-sm text-muted-foreground">Views the element at the front without removing it</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium">isEmpty</h4>
                  <p className="text-sm text-muted-foreground">Checks if the queue contains any elements</p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="applications" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-medium mb-2">Real-world Applications</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li><span className="font-medium text-primary">Print Spooling:</span> Documents are printed in the order they are sent</li>
                <li><span className="font-medium text-primary">Process Scheduling:</span> OS processes tasks in order of arrival</li>
                <li><span className="font-medium text-primary">Breadth-First Search:</span> Algorithm for traversing graph structures</li>
                <li><span className="font-medium text-primary">Message Queues:</span> In distributed systems for asynchronous communication</li>
                <li><span className="font-medium text-primary">Buffering:</span> For keyboard inputs, network data packets, etc.</li>
                <li><span className="font-medium text-primary">Customer Service:</span> Handling support tickets in the order received</li>
              </ul>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FifoExplanation;
