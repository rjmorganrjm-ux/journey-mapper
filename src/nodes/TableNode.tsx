import { Handle, Position, useReactFlow, NodeResizer } from '@xyflow/react';
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Plus, X, ChevronDown, ExternalLink, Copy, Star, Calendar } from 'lucide-react';
import { formatManualRange } from '../utils/dateUtils';
import { NODE_TEMPLATES } from '../utils/nodeTemplates';

export const METRIC_OPTIONS = [
  'Impressions',
  'Clicks',
  'Views',
  'Signups',
  'Conversions',
  'Bounce Rate',
  'Engagements',
  'Leads',
  'Sales',
  'Revenue',
  'CTR',
  'CPA',
  'ROAS',
  'LTV',
  'Avg. Position',
  'Avg. Scroll Depth',
  'CTA Clicks'
];

const TOOL_OPTIONS = [
  'Google Analytics',
  'Search Console',
  'Stripe',
  'HubSpot',
  'Salesforce',
  'Facebook Ads',
  'Google Ads',
  'TikTok Ads',
  'LinkedIn Ads',
  'Mailchimp',
  'Klaviyo',
  'Mixpanel',
  'Amplitude',
  'Heap',
  'Shopify',
  'Magento',
  'MyAccount'
];

export type ColumnSchema = {
  id: string;
  name: string;
  isStat: boolean;
};

export type RowData = Record<string, string> & { id: string };

export type TableNodeData = {
  title: string;
  category?: string;
  color?: string;
  url?: string;
  columns: ColumnSchema[];
  rows: RowData[];
  onSaveTemplate?: (data: any) => void;
};

function CellSelectOrInput({
  value,
  options,
  onChange
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  const [isCustom, setIsCustom] = useState(false);
  const isValueCustom = value !== '' && !options.includes(value);

  if (isCustom || isValueCustom) {
    return (
      <div className="relative flex items-center group/custom">
        <input
          autoFocus={isCustom && value === ''}
          className="w-full p-2 pr-6 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-400 focus:bg-blue-50/50 outline-none transition-colors rounded text-slate-800"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type..."
        />
        <button
          onClick={() => { setIsCustom(false); onChange(''); }}
          className="absolute right-1 text-slate-300 hover:text-slate-600 opacity-0 group-hover/custom:opacity-100 transition-opacity p-1"
          title="Back to list"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        className="w-full p-2 pr-6 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-400 focus:bg-blue-50/50 outline-none transition-colors rounded text-slate-800 appearance-none font-medium"
        value={value}
        onChange={(e) => {
          if (e.target.value === '__custom__') {
            setIsCustom(true);
            onChange('');
          } else {
            onChange(e.target.value);
          }
        }}
      >
        <option value="">-- Select --</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value="__custom__" className="font-bold text-blue-600 bg-blue-50 shadow-inner">Custom...</option>
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export function TableNode({ id, data, selected }: { id: string, data: TableNodeData, selected: boolean }) {
  const { updateNodeData, getNodes, setNodes } = useReactFlow();
  const [openDatePicker, setOpenDatePicker] = useState<string | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDatePicker(null);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    if (openDatePicker || isCategoryMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDatePicker, isCategoryMenuOpen]);

  const applyTemplate = useCallback((templateType: string) => {
    const template = NODE_TEMPLATES[templateType];
    if (!template) return;

    updateNodeData(id, {
      category: template.label,
      color: template.color
    });
    setIsCategoryMenuOpen(false);
  }, [id, updateNodeData]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { title: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { url: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleRowChange = useCallback(
    (rowId: string, colId: string, value: string) => {
      const newRows = data.rows.map((row: RowData) =>
        row.id === rowId ? { ...row, [colId]: value } : row
      );
      updateNodeData(id, { rows: newRows });
    },
    [id, data.rows, updateNodeData]
  );

  const handleColumnNameChange = useCallback(
    (colId: string, name: string) => {
      const newColumns = data.columns.map((c: ColumnSchema) => c.id === colId ? { ...c, name } : c);
      updateNodeData(id, { columns: newColumns });
    },
    [id, data.columns, updateNodeData]
  );

  const addColumn = useCallback((isStat: boolean) => {
    const colId = `c_${Date.now()}`;
    const newCol: ColumnSchema = { id: colId, name: isStat ? 'New Stat' : 'New Col', isStat };
    const newColumns = [...data.columns, newCol];

    // Add this column's key to all existing rows
    const newRows = data.rows.map((r: RowData) => ({ ...r, [colId]: '' }));

    updateNodeData(id, { columns: newColumns, rows: newRows });
  }, [id, data.columns, data.rows, updateNodeData]);

  const addRow = useCallback(() => {
    const rowId = `r_${Date.now()}`;
    const newRow: RowData = { id: rowId };
    data.columns.forEach((c: ColumnSchema) => newRow[c.id] = '');
    updateNodeData(id, { rows: [...data.rows, newRow] });
  }, [id, data.columns, data.rows, updateNodeData]);

  const deleteRow = useCallback((rowId: string) => {
    updateNodeData(id, { rows: data.rows.filter((r: RowData) => r.id !== rowId) });
  }, [id, data.rows, updateNodeData]);

  const deleteColumn = useCallback((colId: string) => {
    updateNodeData(id, { columns: data.columns.filter((c: ColumnSchema) => c.id !== colId) });
  }, [id, data.columns, updateNodeData]);

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

  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');

  // Close reset
  useEffect(() => {
    if (!openDatePicker) {
      setManualStart('');
      setManualEnd('');
    }
  }, [openDatePicker]);

  const applyManualRange = async (colId: string) => {
    if (manualStart && manualEnd) {
      handleColumnNameChange(colId, formatManualRange(manualStart, manualEnd));
      setOpenDatePicker(null);
    }
  };

  const headerColor = data.color || 'bg-blue-600';
  const columns = data.columns || [];
  const rows = data.rows || [];

  const statColumns = useMemo(() => columns.filter((c: ColumnSchema) => c.isStat), [columns]);
  const hasChangeColumn = statColumns.length >= 2;
  const lastStat = statColumns[statColumns.length - 1];
  const secondLastStat = statColumns[statColumns.length - 2];

  return (
    <div className="bg-white shadow-xl flex flex-col rounded-xl border border-slate-200 h-full w-full font-sans text-sm transition-all hover:shadow-2xl relative group/node">
      <NodeResizer 
        minWidth={500} 
        minHeight={150} 
        isVisible={selected} 
        lineClassName="border-blue-400/50" 
        handleClassName="h-6 w-6 bg-white border-2 border-blue-400 rounded-full shadow-lg -m-1 hover:scale-110 transition-transform cursor-nwse-resize"
      />
      
      <Handle type="target" position={Position.Top} id="top" className="!w-4 !h-4 !bg-slate-400 border-2 border-white rounded-full z-10" />
      <Handle type="target" position={Position.Left} id="left" className="!w-4 !h-4 !bg-slate-400 border-2 border-white rounded-full z-10" />

      {/* Node Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover/node:opacity-100 transition-opacity flex gap-1 z-20">
        <button 
          onClick={() => data.onSaveTemplate?.(data)}
          className="p-1 px-1.5 bg-white/20 hover:bg-white/40 text-white rounded transition-colors"
          title="Save to Library"
        >
          <Star className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-white/20 mx-0.5 self-center"></div>
        <button 
          onClick={duplicateNode}
          className="p-1 px-1.5 bg-white/20 hover:bg-white/40 text-white rounded transition-colors"
          title="Duplicate Node"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={deleteNode}
          className="p-1 px-1.5 bg-white/20 hover:bg-rose-500 text-white rounded transition-colors"
          title="Delete Node"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header */}
      <div className={`${headerColor} p-4 pb-3 flex flex-col gap-2 transition-all duration-500 rounded-t-xl relative`}>
        <div className="relative flex items-center gap-1 group/header" ref={categoryMenuRef}>
          <div className="flex-1 flex flex-col min-w-0">
            {data.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-0.5">
                {data.category}
              </span>
            )}
            <input
              value={data.title}
              onChange={handleTitleChange}
              className="bg-transparent text-white font-bold text-lg border-none outline-none focus:ring-2 focus:ring-white/30 rounded px-1 -ml-1 w-full placeholder:text-white/50 transition-all hover:bg-white/10"
              placeholder="Step Name..."
            />
          </div>
          <button 
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white/70 hover:text-white self-start mt-1"
            title="Switch Node Category"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCategoryMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-2xl border border-slate-200 rounded-xl z-50 py-2 flex flex-col text-slate-700 shadow-indigo-500/10 backdrop-blur-xl animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Switch Category</div>
              {Object.values(NODE_TEMPLATES).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group/item text-left"
                >
                  <div className={`w-3 h-3 rounded-full ${tpl.color} shadow-sm group-hover/item:scale-125 transition-transform`}></div>
                  <span className="text-sm font-medium">{tpl.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1 items-center bg-black/10 rounded-md p-1 pl-2 focus-within:bg-black/20 focus-within:ring-2 focus-within:ring-white/50 transition-all border border-white/5 group/url">
          <input
            value={data.url || ''}
            onChange={handleUrlChange}
            placeholder="https://..."
            className="bg-transparent text-white/90 outline-none w-full text-xs placeholder:text-white/40 font-mono pr-8"
          />
          {data.url && (
            <a href={data.url.startsWith('http') ? data.url : `https://${data.url}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white/20 rounded text-white flex-shrink-0 transition-colors" title="Open Link">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="p-0 overflow-auto min-h-[50px] flex-1">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider sticky top-0 z-10">
              {columns.map((col: ColumnSchema) => (
                <th key={col.id} className="p-3 font-semibold relative group/th bg-slate-50">
                  <div className="flex items-center gap-1">
                    {col.isStat && (
                       <div className="relative">
                          <button
                            onClick={() => setOpenDatePicker(col.id)}
                            className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                            title="Set Date Range"
                          >
                            <Calendar className="w-3 h-3" />
                          </button>
                          
                          {openDatePicker === col.id && (
                            <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-52 bg-white shadow-2xl border border-slate-200 rounded-xl z-50 py-1 flex flex-col normal-case tracking-normal">
                               <div className="p-3 flex flex-col gap-3">
                                 <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Start Date</label>
                                    <input 
                                      type="date" 
                                      value={manualStart}
                                      onChange={(e) => setManualStart(e.target.value)}
                                      className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-300 w-full"
                                    />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">End Date</label>
                                    <input 
                                      type="date" 
                                      value={manualEnd}
                                      onChange={(e) => setManualEnd(e.target.value)}
                                      className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-300 w-full"
                                    />
                                 </div>
                                 <div className="pt-1 flex gap-2">
                                    <button 
                                      onClick={() => setOpenDatePicker(null)}
                                      className="flex-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest py-2 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => applyManualRange(col.id)}
                                      disabled={!manualStart || !manualEnd}
                                      className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
                                    >
                                      Apply
                                    </button>
                                 </div>
                               </div>
                            </div>
                          )}
                       </div>
                    )}
                    <input
                      value={col.name}
                      onChange={(e) => handleColumnNameChange(col.id, e.target.value)}
                      className="bg-transparent w-full outline-none focus:text-blue-600 focus:bg-blue-50 px-1 rounded placeholder:text-slate-300 min-w-[60px]"
                      placeholder="Col Name"
                    />
                    <button
                      onClick={() => deleteColumn(col.id)}
                      className="opacity-0 group-hover/th:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity"
                      title="Delete Column"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              {hasChangeColumn && (
                <th className="p-3 font-semibold text-center text-emerald-600 bg-slate-50">Change</th>
              )}
              <th className="p-3 w-16 bg-slate-50">
                <div className="flex gap-1 justify-center">
                  <button onClick={() => addColumn(false)} className="text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-100 rounded p-1" title="Add Text Col"><Plus className="w-3.5 h-3.5" /></button>
                  <button onClick={() => addColumn(true)} className="text-slate-400 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-100 rounded p-1" title="Add Stat Col"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: RowData, index: number) => (
              <tr key={row.id} className={`group/tr ${index !== rows.length - 1 ? 'border-b border-slate-100' : ''}`}>
                {columns.map((col: ColumnSchema) => (
                  <td key={col.id} className="p-1 px-2 min-w-[100px]">
                    {col.name.toLowerCase() === 'metric' ? (
                      <CellSelectOrInput
                        value={row[col.id] || ''}
                        options={METRIC_OPTIONS}
                        onChange={(val) => handleRowChange(row.id, col.id, val)}
                      />
                    ) : col.name.toLowerCase() === 'tool' ? (
                      <CellSelectOrInput
                        value={row[col.id] || ''}
                        options={TOOL_OPTIONS}
                        onChange={(val) => handleRowChange(row.id, col.id, val)}
                      />
                    ) : (
                      <input
                        className={`w-full p-2 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-400 focus:bg-blue-50/50 outline-none transition-colors rounded ${col.isStat ? 'font-mono text-slate-800' : 'text-slate-700'}`}
                        value={row[col.id] || ''}
                        onChange={(e) => handleRowChange(row.id, col.id, e.target.value)}
                        placeholder={col.isStat ? '0' : '...'}
                      />
                    )}
                  </td>
                ))}

                {hasChangeColumn && (
                  <td className="p-1 px-2 w-[120px] min-w-[120px]">
                    {(() => {
                      const pastStr = row[secondLastStat.id] || '';
                      const currentStr = row[lastStat.id] || '';
                      const past = parseFloat(pastStr.replace(/,/g, ''));
                      const current = parseFloat(currentStr.replace(/,/g, ''));
                      let changeStr = '-';
                      let colorClass = 'text-slate-400';
                      if (!isNaN(past) && !isNaN(current) && past !== 0) {
                        const change = ((current - past) / past) * 100;
                        changeStr = (change > 0 ? '+' : '') + change.toFixed(1) + '%';
                        colorClass = change > 0 ? 'text-emerald-700 bg-emerald-50/50' : (change < 0 ? 'text-rose-700 bg-rose-50/50' : 'text-slate-600 bg-slate-50/50');
                      }
                      return (
                        <div className={`w-full p-2 rounded font-mono font-medium text-center ${colorClass}`}>
                          {changeStr}
                        </div>
                      );
                    })()}
                  </td>
                )}

                <td className="p-1 text-center w-16">
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="opacity-0 group-hover/tr:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity p-1 mx-auto block"
                    title="Delete Row"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-2 border-t border-slate-100 opacity-0 group-hover/node:opacity-100 transition-opacity flex justify-center pb-3">
        <button onClick={addRow} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-full bg-slate-200/50 hover:bg-blue-100 transition-colors">
          <Plus className="w-3 h-3" /> Add Row
        </button>
      </div>

      <Handle type="source" position={Position.Right} id="right" className="!w-4 !h-4 !bg-slate-400 border-2 border-white rounded-full z-10" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-4 !h-4 !bg-slate-400 border-2 border-white rounded-full z-10" />
    </div>
  );
}
