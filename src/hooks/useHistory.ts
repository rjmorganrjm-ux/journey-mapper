import { useCallback, useState } from 'react';
import { Node, Edge } from '@xyflow/react';

export type Snapshot = {
  nodes: Node[];
  edges: Edge[];
};

export function useHistory(initialNodes: Node[], initialEdges: Edge[]) {
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  
  const [lastSnapshot, setLastSnapshot] = useState<Snapshot>({ 
    nodes: JSON.parse(JSON.stringify(initialNodes)), 
    edges: JSON.parse(JSON.stringify(initialEdges)) 
  });

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    const currentSnapshot: Snapshot = JSON.parse(JSON.stringify({ nodes, edges }));
    
    // Simple state comparison to avoid redundant snapshots
    if (JSON.stringify(lastSnapshot) === JSON.stringify(currentSnapshot)) {
        return;
    }
    
    setPast((p) => [...p.slice(-49), lastSnapshot]); // Keep last 50 steps
    setFuture([]);
    setLastSnapshot(currentSnapshot);
  }, [lastSnapshot]);

  const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (past.length === 0) return null;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture((f) => [...f, JSON.parse(JSON.stringify({ nodes: currentNodes, edges: currentEdges }))]);
    setPast(newPast);
    setLastSnapshot(JSON.parse(JSON.stringify(previous)));
    
    return previous;
  }, [past]);

  const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (future.length === 0) return null;
    
    const next = future[future.length - 1];
    const newFuture = future.slice(0, future.length - 1);
    
    setPast((p) => [...p, JSON.parse(JSON.stringify({ nodes: currentNodes, edges: currentEdges }))]);
    setFuture(newFuture);
    setLastSnapshot(JSON.parse(JSON.stringify(next)));
    
    return next;
  }, [future]);

  const forceClear = useCallback((nodes: Node[], edges: Edge[]) => {
    setPast([]);
    setFuture([]);
    setLastSnapshot(JSON.parse(JSON.stringify({ nodes, edges })));
  }, []);

  return {
    takeSnapshot,
    undo,
    redo,
    forceClear,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
