import React from 'react';

export default function PortfolioList({ portfolios = [], selectedId, onSelect, onCreate, onDelete, onRename }) {
  return (
    <div className="fixed top-6 left-6 z-50 w-[260px] bg-black/60 backdrop-blur rounded-xl border border-white/10 p-3 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold">Portfolios</h4>
        <button onClick={() => onCreate && onCreate()} className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20">New</button>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {portfolios.length === 0 && <div className="text-sm text-gray-400">생성된 포트폴리오가 없습니다.</div>}
        {portfolios.map(p => (
          <div key={p.id} className={`flex items-center justify-between p-2 rounded ${selectedId === p.id ? 'bg-white/5 border border-white/10' : 'hover:bg-white/3'}`}>
            <button onClick={() => onSelect && onSelect(p.id)} className="text-left flex-1 truncate font-medium">{p.name}</button>
            <div className="flex items-center gap-1 ml-2">
              <button onClick={() => onRename && onRename(p.id)} title="Rename" className="text-xs px-2 py-1 bg-white/5 rounded">✎</button>
              <button onClick={() => onDelete && onDelete(p.id)} title="Delete" className="text-xs px-2 py-1 bg-red-600/60 rounded">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
