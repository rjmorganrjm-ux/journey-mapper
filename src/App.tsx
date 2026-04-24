import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  MarkerType,
  getNodesBounds,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { TableNode } from './nodes/TableNode';
import { NoteNode } from './nodes/NoteNode';
import { CustomEdge } from './edges/CustomEdge';
import { Toolbar } from './components/Toolbar';
import { useHistory } from './hooks/useHistory';
import { NODE_TEMPLATES } from './utils/nodeTemplates';

const PERSISTENCE_KEY = 'journey_mapper_state';
const RECENTS_KEY = 'journey_mapper_recents';
const TEMPLATES_KEY = 'journey_mapper_custom_templates';
const QUICK_LINKS_KEY = 'journey_mapper_global_quick_links';

const nodeTypes = {
  table: TableNode,
  note: NoteNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'table',
    position: { x: 250, y: 150 },
    data: {
      title: 'Organic Search',
      color: 'bg-emerald-600',
      columns: [
        { id: 'c_metric', name: 'Metric', isStat: false },
        { id: 'c_tool', name: 'Tool', isStat: false },
        { id: 'c_past', name: 'Past', isStat: true },
        { id: 'c_curr', name: 'Current', isStat: true },
      ],
      rows: [
        { id: 'r1', c_metric: 'Impressions', c_tool: 'Search Console', c_past: '12500', c_curr: '14500' },
        { id: 'r2', c_metric: 'Clicks', c_tool: 'Search Console', c_past: '2900', c_curr: '3200' },
      ],
    },
  },
  {
    id: '2',
    type: 'table',
    position: { x: 750, y: 300 },
    data: {
      title: 'Landing Page',
      color: 'bg-blue-600',
      columns: [
        { id: 'c_metric', name: 'Metric', isStat: false },
        { id: 'c_tool', name: 'Tool', isStat: false },
        { id: 'c_past', name: 'Past', isStat: true },
        { id: 'c_curr', name: 'Current', isStat: true },
      ],
      rows: [
        { id: 'r1', c_metric: 'Views', c_tool: 'Google Analytics', c_past: '2950', c_curr: '3150' },
        { id: 'r2', c_metric: 'Signups', c_tool: 'Stripe', c_past: '360', c_curr: '420' },
      ],
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'custom',
    data: { pastStat: '220', currentStat: '254', showMetric: false },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export type RecentJourney = {
  id: string;
  name: string;
  lastModified: number;
  data: any;
};

export type CustomTemplate = {
  id: string;
  name: string;
  data: any;
};

const getSavedState = (key: string) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error(`Failed to load saved state for ${key}`, err);
  }
  return null;
};

function FlowApp() {
  const savedState = getSavedState(PERSISTENCE_KEY);
  const savedRecents = getSavedState(RECENTS_KEY) || [];
  const savedTemplates = getSavedState(TEMPLATES_KEY) || [];
  const savedQuickLinks = getSavedState(QUICK_LINKS_KEY) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(savedState?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(savedState?.edges || initialEdges);
  const [quickLinks, setQuickLinks] = useState<{ label: string, url: string }[]>(savedQuickLinks);
  const [journeyName, setJourneyName] = useState(savedState?.journeyName || 'My Marketing Journey');
  const [journeyId, setJourneyId] = useState(savedState?.id || `j_${Date.now()}`);
  const [recentJourneys, setRecentJourneys] = useState<RecentJourney[]>(savedRecents);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(savedTemplates);
  const [isExporting, setIsExporting] = useState(false);
  
  const isRestoring = useRef(false);
  const { takeSnapshot, undo, redo, forceClear, canUndo, canRedo } = useHistory(nodes, edges);
  const { fitView } = useReactFlow();

  const handleUndo = useCallback(() => {
    const prevState = undo(nodes, edges);
    if (prevState) {
      isRestoring.current = true;
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setTimeout(() => { isRestoring.current = false; }, 50);
    }
  }, [undo, nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const nextState = redo(nodes, edges);
    if (nextState) {
      isRestoring.current = true;
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setTimeout(() => { isRestoring.current = false; }, 50);
    }
  }, [redo, nodes, edges, setNodes, setEdges]);

  // Debounced Auto-Snapshot for history (700ms)
  useEffect(() => {
    if (isRestoring.current) return;
    const isDragging = nodes.some(n => n.dragging);
    if (isDragging) return;

    const timer = setTimeout(() => {
      takeSnapshot(nodes, edges);
    }, 700);
    return () => clearTimeout(timer);
  }, [nodes, edges, takeSnapshot]);

  // AUTO-SAVE to localStorage & UPDATE RECENTS
  useEffect(() => {
    const timer = setTimeout(() => {
      const stateToSave = { id: journeyId, nodes, edges, journeyName };
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(stateToSave));
      
      setRecentJourneys(prev => {
        const otherRecents = prev.filter(r => r.id !== journeyId);
        const updated = [
          { id: journeyId, name: journeyName, lastModified: Date.now(), data: stateToSave },
          ...otherRecents
        ].slice(0, 5); 
        localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges, journeyName, journeyId]);

  // SYNC Templates to localStorage
  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
  }, [customTemplates]);

  // SYNC Quick Links to global localStorage
  useEffect(() => {
    localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify(quickLinks));
  }, [quickLinks]);

  // Keyboard binds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      if (cmdKey && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge = {
        ...params,
        type: 'custom',
        data: { showMetric: false },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleSaveAsTemplate = useCallback((nodeData: any) => {
    const templateName = window.prompt('Enter a name for this template:', nodeData.title || 'New Template');
    if (!templateName) return;

    setCustomTemplates(prev => [
      { id: `tpl_${Date.now()}`, name: templateName, data: nodeData },
      ...prev
    ]);
  }, []);

  const handleDeleteTemplate = useCallback((tplId: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== tplId));
  }, []);

  const handleExportPDF = useCallback(async () => {
    const el = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!el) return;

    setIsExporting(true);
    try {
      // Fit view first to encompass all nodes
      await fitView({ padding: 0.1 });
      
      // Wait for fitView to settle
      await new Promise(r => setTimeout(r, 400));

      const bounds = getNodesBounds(nodes);
      
      const dataUrl = await toPng(el, {
        backgroundColor: '#f8fafc', // match slate-50
        style: {
          width: bounds.width + 'px',
          height: bounds.height + 'px',
          transform: `translate(${-bounds.x}px, ${-bounds.y}px) scale(1)`,
        },
        pixelRatio: 2, // High res
      });

      const pdf = new jsPDF({
        orientation: bounds.width > bounds.height ? 'l' : 'p',
        unit: 'px',
        format: [bounds.width + 100, bounds.height + 100],
      });

      pdf.addImage(dataUrl, 'PNG', 50, 50, bounds.width, bounds.height);
      const safeName = journeyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [nodes, journeyName, fitView]);

  const handleAddNode = useCallback((templateType: string = 'blank', customData?: any) => {
    const id = `node_${Date.now()}`;
    
    if (templateType === 'custom' && customData) {
      const newNode: Node = {
        id,
        type: 'table',
        position: { x: Math.random() * 200 + window.innerWidth / 2 - 200, y: Math.random() * 200 + window.innerHeight / 2 - 200 },
        data: { ...customData },
      };
      setNodes((nds) => [...nds, newNode]);
      return;
    }

    if (templateType === 'sticky_note') {
      const newNode: Node = {
        id,
        type: 'note',
        position: { x: Math.random() * 200 + window.innerWidth / 2 - 100, y: Math.random() * 200 + window.innerHeight / 2 - 100 },
        data: { content: '' },
        style: { width: 200, height: 200 }
      };
      setNodes((nds) => [...nds, newNode]);
      return;
    }

    const template = NODE_TEMPLATES[templateType];
    
    let title = template?.title || 'New Step';
    let category = template?.label || '';
    let color = template?.color || 'bg-blue-600';
    let columns = [
      { id: 'c_metric', name: 'Metric', isStat: false },
      { id: 'c_tool', name: 'Tool', isStat: false },
      { id: 'c_past', name: 'Past', isStat: true },
      { id: 'c_curr', name: 'Current', isStat: true },
    ];
    let rows = template?.rows ? JSON.parse(JSON.stringify(template.rows)) : [
      { id: 'r1', c_metric: '', c_tool: '', c_past: '', c_curr: '' },
      { id: 'r2', c_metric: '', c_tool: '', c_past: '', c_curr: '' },
      { id: 'r3', c_metric: '', c_tool: '', c_past: '', c_curr: '' },
    ];

    const newNode: Node = {
      id,
      type: 'table',
      position: { x: Math.random() * 200 + window.innerWidth / 2 - 200, y: Math.random() * 200 + window.innerHeight / 2 - 200 },
      data: {
        title,
        category,
        color,
        columns,
        rows
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleAddQuickLink = useCallback((label: string, url: string) => {
    setQuickLinks(prev => [...prev, { label, url }]);
  }, []);

  const handleRemoveQuickLink = useCallback((index: number) => {
    setQuickLinks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    try {
      const flowData = { id: journeyId, nodes, edges, journeyName };
      const jsonStr = JSON.stringify(flowData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = journeyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeName}-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      window.alert(`Saved "${journeyName}"! Check your Downloads folder.`);
    } catch (err) {
      console.error('Failed to save workspace', err);
    }
  }, [nodes, edges, journeyName, journeyId]);

  const handleLoad = useCallback(
    (jsonStr: string) => {
      try {
        const flowData = JSON.parse(jsonStr);
        if (flowData.id) setJourneyId(flowData.id);
        else setJourneyId(`j_${Date.now()}`);
        if (flowData.nodes) setNodes(flowData.nodes);
        if (flowData.edges) setEdges(flowData.edges);
        if (flowData.journeyName) setJourneyName(flowData.journeyName);
        forceClear(flowData.nodes || [], flowData.edges || []);
      } catch (err) {
        console.error('Failed to parse graph data', err);
        alert('Invalid workspace file.');
      }
    },
    [setNodes, setEdges, forceClear, setJourneyName, setJourneyId]
  );

  const handleLoadRecent = useCallback((journey: RecentJourney) => {
    const flowData = journey.data;
    setJourneyId(journey.id);
    setNodes(flowData.nodes || []);
    setEdges(flowData.edges || []);
    setJourneyName(flowData.name || journey.name);
    forceClear(flowData.nodes || [], flowData.edges || []);
  }, [setNodes, setEdges, forceClear, setJourneyId]);

  const handleNewJourney = useCallback(() => {
    setJourneyId(`j_${Date.now()}`);
    setJourneyName('Untitled Journey');
    setNodes([]);
    setEdges([]);
    forceClear([], []);
  }, [setNodes, setEdges, forceClear]);

  const handleClearRecents = useCallback(() => {
    setRecentJourneys([]);
    localStorage.removeItem(RECENTS_KEY);
  }, []);

  const handleDeleteRecent = useCallback((id: string) => {
    setRecentJourneys(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Enrich node data with the template handler
  const enrichedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onSaveTemplate: handleSaveAsTemplate
    }
  }));

  return (
    <div className="w-full h-screen bg-slate-50 relative font-sans">
      <Toolbar 
        onAddNode={handleAddNode} 
        onSave={handleSave} 
        onLoad={handleLoad} 
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        quickLinks={quickLinks}
        onAddQuickLink={handleAddQuickLink}
        onRemoveQuickLink={handleRemoveQuickLink}
        journeyName={journeyName}
        onJourneyNameChange={setJourneyName}
        recentJourneys={recentJourneys}
        activeJourneyId={journeyId}
        onLoadRecent={handleLoadRecent}
        onClearRecents={handleClearRecents}
        onDeleteRecent={handleDeleteRecent}
        onNewJourney={handleNewJourney}
        customTemplates={customTemplates}
        onDeleteTemplate={handleDeleteTemplate}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
      />
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }}
        snapToGrid={true}
        snapGrid={[15, 15]}
        fitView
      >
        <Background gap={15} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} className="bg-white shadow-lg border border-slate-200 rounded-lg p-1" />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowApp />
    </ReactFlowProvider>
  );
}
