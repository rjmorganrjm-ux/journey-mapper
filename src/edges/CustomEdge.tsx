import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import React, { useCallback } from 'react';
import { X, ChevronDown, EyeOff, Activity } from 'lucide-react';
import { METRIC_OPTIONS } from '../nodes/TableNode';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onPastChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                pastStat: e.target.value,
              },
            };
          }
          return edge;
        })
      );
    },
    [id, setEdges]
  );

  const onCurrentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                currentStat: e.target.value,
              },
            };
          }
          return edge;
        })
      );
    },
    [id, setEdges]
  );

  const onMetricChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                metric: e.target.value,
              },
            };
          }
          return edge;
        })
      );
    },
    [id, setEdges]
  );

  const onToggleMetric = useCallback(
    () => {
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                showMetric: !edge.data?.showMetric,
              },
            };
          }
          return edge;
        })
      );
    },
    [id, setEdges]
  );

  const deleteEdge = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  }, [id, setEdges]);

  const isShown = data?.showMetric === true;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {isShown ? (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex flex-col gap-1.5 text-sm font-semibold text-slate-700 transition-all hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 group min-w-[140px]"
          >
            {/* Metric Selection & Toggle */}
            <div className="relative flex items-center gap-1">
              <div className="relative flex-1">
                <select
                  value={(data?.metric as string) || ''}
                  onChange={onMetricChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded px-1.5 py-1 outline-none text-[10px] font-bold text-indigo-600 appearance-none uppercase tracking-wider mb-0.5"
                >
                  <option value="">-- Metric --</option>
                  {METRIC_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-indigo-400 absolute right-1.5 top-1.5 pointer-events-none" />
              </div>
              <button 
                onClick={onToggleMetric}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                title="Hide Metrics for this connection"
              >
                <EyeOff className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1 justify-center">
              <input 
                value={(data?.pastStat as string) || ''} 
                onChange={onPastChange} 
                className="w-14 bg-slate-50 border border-slate-100 rounded px-1 py-0.5 outline-none text-center font-mono placeholder:text-slate-300 placeholder:font-normal text-xs focus:border-blue-400" 
                placeholder="Past" 
              />
              <span className="text-slate-300 text-xs">→</span>
              <input 
                value={(data?.currentStat as string) || ''} 
                onChange={onCurrentChange} 
                className="w-14 bg-slate-50 border border-slate-100 rounded px-1 py-0.5 outline-none text-center font-mono placeholder:text-slate-300 placeholder:font-normal text-xs focus:border-blue-400" 
                placeholder="Curr" 
              />
            </div>
            
            {(() => {
              const pastStr = (data?.pastStat as string) || '';
              const currentStr = (data?.currentStat as string) || '';
              const past = parseFloat(pastStr.replace(/,/g, ''));
              const current = parseFloat(currentStr.replace(/,/g, ''));
              let changeStr = '-';
              let colorClass = 'text-slate-400';
              if (!isNaN(past) && !isNaN(current) && past !== 0) {
                const change = ((current - past) / past) * 100;
                changeStr = (change > 0 ? '+' : '') + change.toFixed(1) + '%';
                colorClass = change > 0 ? 'text-emerald-700 bg-emerald-50/10' : (change < 0 ? 'text-rose-700 bg-rose-50/10' : 'text-slate-600 bg-slate-50/10');
              }
              return (
                <div className="relative">
                  <div className={`w-full py-0.5 rounded text-[10px] font-mono font-bold text-center ${colorClass}`}>
                    {changeStr}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteEdge(); }}
                    className="absolute -right-[36px] top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors p-1 bg-white rounded-full shadow border border-slate-100 opacity-0 group-hover:opacity-100"
                    title="Delete Connection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              onClick={onToggleMetric}
              className="w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-110 active:scale-95 group"
              title="Click to add metrics to this connection"
            >
              <Activity className="w-4 h-4 group-hover:animate-pulse" />
            </button>
            <button
               onClick={(e) => { e.stopPropagation(); deleteEdge(); }}
               className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
            >
               <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
