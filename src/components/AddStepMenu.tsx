import React from 'react';
import { StickyNote, Star, Trash2 } from 'lucide-react';
import { CustomTemplate } from '../App';

type AddStepMenuProps = {
  onAddNode: (templateType: string, customData?: any) => void;
  customTemplates: CustomTemplate[];
  onDeleteTemplate: (id: string) => void;
  className?: string;
  onMenuItemClick?: () => void;
};

export function AddStepMenu({ onAddNode, customTemplates, onDeleteTemplate, className = '', onMenuItemClick }: AddStepMenuProps) {
  const handleAdd = (type: string, data?: any) => {
    onAddNode(type, data);
    if (onMenuItemClick) onMenuItemClick();
  };

  return (
    <div className={`bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden divide-y divide-slate-100 rounded-xl whitespace-normal ${className}`}>
      <button onClick={() => handleAdd('blank')} className="text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">Blank Node</button>
      <button onClick={() => handleAdd('sticky_note')} className="text-left px-4 py-3 hover:bg-yellow-50 text-sm font-semibold text-yellow-700 transition-colors flex items-center gap-2">
        <StickyNote className="w-3.5 h-3.5" />
        Sticky Note
      </button>
      
      {customTemplates.length > 0 && (
        <>
          <div className="bg-amber-50 px-4 py-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-widest border-t border-amber-100 flex items-center gap-1">
            <Star className="w-2.5 h-2.5" />
            My Library
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
            {customTemplates.map(tpl => (
              <div key={tpl.id} className="group/tpl flex items-center justify-between hover:bg-amber-50/50 transition-colors">
                <button 
                  onClick={() => handleAdd('custom', tpl.data)} 
                  className="text-left px-4 py-2.5 text-xs font-semibold text-amber-900 truncate flex-1"
                >
                  {tpl.name}
                </button>
                <button 
                  onClick={() => onDeleteTemplate(tpl.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover/tpl:opacity-100 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="bg-slate-50 px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">Marketing Templates</div>
      <button onClick={() => handleAdd('organic_search')} className="text-left px-4 py-3 hover:bg-emerald-50 text-sm font-medium text-emerald-700 transition-colors border-b border-slate-50">Organic Search</button>
      <button onClick={() => handleAdd('paid_search')} className="text-left px-4 py-3 hover:bg-amber-50 text-sm font-medium text-amber-600 transition-colors border-b border-slate-50">Paid Search Ads</button>
      <button onClick={() => handleAdd('paid_social')} className="text-left px-4 py-3 hover:bg-purple-50 text-sm font-medium text-purple-700 transition-colors border-b border-slate-50">Paid Social Ads</button>
      <button onClick={() => handleAdd('landing_page')} className="text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium text-blue-700 transition-colors border-b border-slate-50">Landing Page</button>
      <button onClick={() => handleAdd('gated_content')} className="text-left px-4 py-3 hover:bg-slate-100 text-sm font-medium text-slate-800 transition-colors border-b border-slate-50">Gated Content LP</button>
      <button onClick={() => handleAdd('product_page')} className="text-left px-4 py-3 hover:bg-blue-100 text-sm font-medium text-blue-900 transition-colors border-b border-slate-50">Product Page</button>
      <button onClick={() => handleAdd('email_campaign')} className="text-left px-4 py-3 hover:bg-indigo-50 text-sm font-medium text-indigo-700 transition-colors border-b border-slate-50">Email Campaign</button>
      <button onClick={() => handleAdd('ecommerce_checkout')} className="text-left px-4 py-3 hover:bg-rose-50 text-sm font-medium text-rose-700 transition-colors">E-Commerce</button>
    </div>
  );
}
