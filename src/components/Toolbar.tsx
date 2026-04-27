import { Save, Upload, Plus, ChevronDown, Undo2, Redo2, Link, Trash2, ExternalLink, Edit3, Clock, PlusCircle, X, FileDown, Loader2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { RecentJourney, CustomTemplate } from '../App';
import { AddStepMenu } from './AddStepMenu';

type ToolbarProps = {
  onAddNode: (templateType: string, customData?: any) => void;
  onSave: () => void;
  onLoad: (jsonData: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  quickLinks: { label: string; url: string }[];
  onAddQuickLink: (label: string, url: string) => void;
  onRemoveQuickLink: (index: number) => void;
  journeyName: string;
  onJourneyNameChange: (name: string) => void;
  recentJourneys: RecentJourney[];
  activeJourneyId: string;
  onLoadRecent: (journey: RecentJourney) => void;
  onClearRecents: () => void;
  onDeleteRecent: (id: string) => void;
  onNewJourney: () => void;
  customTemplates: CustomTemplate[];
  onDeleteTemplate: (id: string) => void;
  onExport: (type: 'png' | 'svg' | 'pdf') => void;
  isExporting: boolean;
  onToggleCollapse?: () => void;
  hasSelection?: boolean;
};

function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Toolbar({ 
  onAddNode, 
  onSave, 
  onLoad, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  quickLinks,
  onAddQuickLink,
  onRemoveQuickLink,
  journeyName,
  onJourneyNameChange,
  recentJourneys,
  activeJourneyId,
  onLoadRecent,
  onClearRecents,
  onDeleteRecent,
  onNewJourney,
  customTemplates,
  onDeleteTemplate,
  onExport,
  isExporting,
  onToggleCollapse,
  hasSelection
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onLoad(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (linkLabel && linkUrl) {
      const formattedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      onAddQuickLink(linkLabel, formattedUrl);
      setLinkLabel('');
      setLinkUrl('');
    }
  };

  return (
    <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 sm:bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl sm:rounded-full flex flex-wrap sm:flex-nowrap items-center p-2 sm:p-3 px-4 sm:px-12 border border-slate-200/50 gap-2 sm:gap-6 max-w-[95vw] pointer-events-auto transition-all justify-center">
      {/* Journey Name */}
      <div className="flex items-center gap-3 mr-4">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Edit3 className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <input 
            value={journeyName}
            onChange={(e) => onJourneyNameChange(e.target.value)}
            className="bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-bold text-slate-800 placeholder:text-slate-400 w-28 sm:w-40 truncate"
            placeholder="Journey Name..."
          />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold pointer-events-none -mt-0.5 hidden sm:block">Campaign Workspace</span>
        </div>
      </div>

      <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>

      {/* Main Actions Group (Stay together on one line) */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Add Step Dropdown */}
        <div className="relative group/add">
          <button
            onClick={() => onAddNode('blank')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md text-white rounded-full text-xs sm:text-sm font-semibold transition-all group-hover/add:rounded-b-none"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Step</span>
            <ChevronDown className="w-3 h-3 sm:ml-1" />
          </button>
          <div className="absolute top-[calc(100%-2px)] left-0 w-64 opacity-0 invisible group-hover/add:opacity-100 group-hover/add:visible transition-all z-20">
              <AddStepMenu 
                onAddNode={onAddNode} 
                customTemplates={customTemplates} 
                onDeleteTemplate={onDeleteTemplate}
                className="rounded-tl-none border-t-0"
              />
          </div>
        </div>

        {/* Quick Links Dropdown */}
        <div className="relative group/links">
          <button
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium transition-all"
          >
            <Link className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Links</span>
            <ChevronDown className="w-3 h-3 sm:ml-1" />
          </button>
          <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-slate-200 opacity-0 invisible group-hover/links:opacity-100 group-hover/links:visible transition-all flex flex-col overflow-hidden rounded-xl -mt-2 z-20 p-2 gap-2 whitespace-normal">
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {quickLinks.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4 italic">No links added yet</div>
              )}
              {quickLinks.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between group/link-item hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 truncate flex-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.label}
                  </a>
                  <button 
                    onClick={() => onRemoveQuickLink(idx)}
                    className="opacity-0 group-hover/link-item:opacity-100 p-1 hover:bg-rose-50 text-rose-500 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-100 pt-2 flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Label (e.g. GA4)"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-300"
              />
              <input 
                type="text" 
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-300"
              />
              <button 
                onClick={handleAddLink}
                disabled={!linkLabel || !linkUrl}
                className="bg-indigo-600 text-white text-xs font-semibold py-2 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

      {/* Undo/Redo */}
      <div className="flex bg-slate-100 rounded-full border border-slate-200 p-0.5 relative">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-full transition-colors ${canUndo ? 'hover:bg-white text-slate-700 hover:shadow-sm' : 'text-slate-400 opacity-50 cursor-not-allowed'}`}
          title="Undo (Ctrl/Cmd + Z)"
        >
           <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-full transition-colors ${canRedo ? 'hover:bg-white text-slate-700 hover:shadow-sm' : 'text-slate-400 opacity-50 cursor-not-allowed'}`}
          title="Redo (Ctrl/Cmd + Shift + Z)"
        >
           <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {hasSelection && (
        <>
          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm border border-indigo-200 animate-in fade-in zoom-in-95 duration-200"
            title="Toggle Collapse Selected Nodes (M)"
          >
            <PlusCircle className="w-4 h-4 rotate-45" /> 
            <span>Minimize</span>
          </button>
        </>
      )}

      <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

      {/* Save/Export */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-slate-700 rounded-full text-sm font-medium transition-colors"
          title="Download Current Journey (.json)"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative group/export ml-1">
          <button
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isExporting ? 'bg-slate-100 text-slate-400' : 'hover:bg-indigo-50 text-indigo-600 border border-transparent hover:border-indigo-100'}`}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>

          <div className="absolute top-full right-0 w-56 bg-white shadow-2xl border border-slate-200 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all flex flex-col rounded-xl -mt-2 z-20 pb-1 ring-1 ring-black/5 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Download Map as...</div>
            
            <button 
              onClick={() => onExport('png')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group/item"
            >
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                <FileDown className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">High-Res PNG</span>
                <span className="text-[10px] text-slate-400">Best for presentations</span>
              </div>
            </button>

            <button 
              onClick={() => onExport('svg')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group/item border-t border-slate-50"
            >
              <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center group-hover/item:bg-amber-600 group-hover/item:text-white transition-colors">
                <FileDown className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Scalable SVG</span>
                <span className="text-[10px] text-slate-400">Infinity zoom / Vectors</span>
              </div>
            </button>

            <button 
              onClick={() => onExport('pdf')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group/item border-t border-slate-50"
            >
              <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                <FileDown className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">PDF Document</span>
                <span className="text-[10px] text-slate-400">Standard for sharing</span>
              </div>
            </button>
          </div>
        </div>

        {/* Load Dropdown */}
        <div className="relative group/load ml-2">
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-slate-700 rounded-full text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Load</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
          
          <div className="absolute top-full right-0 w-72 bg-white shadow-2xl border border-slate-200 opacity-0 invisible group-hover/load:opacity-100 group-hover/load:visible transition-all flex flex-col rounded-xl -mt-2 z-20 pb-1 ring-1 ring-black/5 whitespace-normal">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between rounded-t-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Journeys</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onClearRecents(); }}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase"
              >
                Clear
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto min-h-[50px]">
              {recentJourneys.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-slate-400 italic">No recent journeys found</div>
              ) : (
                recentJourneys.map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`group/rec-item flex items-center border-b border-slate-100/50 last:border-0 transition-all ${rec.id === activeJourneyId ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <button
                      onClick={() => onLoadRecent(rec)}
                      className="flex-1 text-left px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-sm font-bold truncate ${rec.id === activeJourneyId ? 'text-indigo-700' : 'text-slate-700 group-hover/rec-item:text-indigo-700'}`}>
                            {rec.name}
                          </span>
                          {rec.id === activeJourneyId ? (
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">Current Session</span>
                          ) : (
                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Previously Edited</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 bg-slate-100/50 px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimeAgo(rec.lastModified)}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteRecent(rec.id); }}
                      className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover/rec-item:opacity-100 transition-all"
                      title="Remove from history"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-2 flex flex-col gap-1 border-t border-slate-100 mt-1">
               <button 
                onClick={onNewJourney}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-100"
               >
                 <PlusCircle className="w-3.5 h-3.5" />
                 Start New Journey
               </button>
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
               >
                 <Upload className="w-3.5 h-3.5" />
                 Import JSON File
               </button>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
