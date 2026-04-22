import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';
import React, { useCallback } from 'react';
import { Copy, X } from 'lucide-react';

export type NoteNodeData = {
  content: string;
  color?: string;
};

export function NoteNode({ id, data, selected }: any) {
  const { updateNodeData, getNodes, setNodes } = useReactFlow();

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { content: e.target.value });
    },
    [id, updateNodeData]
  );

  const duplicateNode = useCallback(() => {
    const nodes = getNodes();
    const currentNode = nodes.find(n => n.id === id);
    if (!currentNode) return;

    const newNode = {
      ...currentNode,
      id: `node_dup_${Date.now()}`,
      position: {
        x: currentNode.position.x + 30,
        y: currentNode.position.y + 30
      },
      selected: false
    };

    setNodes(nds => [...nds, newNode]);
  }, [id, getNodes, setNodes]);

  const deleteNode = useCallback(() => {
    setNodes(nds => nds.filter(n => n.id !== id));
  }, [id, setNodes]);

  return (
    <div className="bg-yellow-100/90 backdrop-blur-sm shadow-xl border-t-4 border-yellow-400/30 h-full w-full rounded p-4 flex flex-col relative group overflow-hidden">
      <NodeResizer 
        minWidth={120} 
        minHeight={120} 
        isVisible={selected} 
        lineClassName="border-yellow-500/50" 
        handleClassName="h-6 w-6 bg-white border-2 border-yellow-500 rounded-full shadow-lg -m-1 hover:scale-110 transition-transform cursor-nwse-resize" 
      />
      
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
        <button 
          onClick={duplicateNode}
          className="p-1 text-yellow-700 hover:bg-yellow-200/50 rounded transition-colors"
          title="Duplicate Note"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={deleteNode}
          className="p-1 text-yellow-700 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
          title="Delete Note"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-yellow-500/20 !border-none" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-yellow-500/20 !border-none" />
      
      <textarea
        value={data.content || ''}
        onChange={handleContentChange}
        className="flex-1 bg-transparent border-none outline-none resize-none text-slate-800 font-medium placeholder:text-yellow-600/30 text-sm leading-relaxed selection:bg-yellow-300 pr-4 mt-2"
        placeholder="Sticky Note..."
      />

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-yellow-500/20 !border-none" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-yellow-500/20 !border-none" />
      
      {/* Decorative fold/shadow */}
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/5 rounded-tl-3xl pointer-events-none"></div>
    </div>
  );
}
