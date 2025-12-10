import React from 'react';
import { GeneratedMeme } from '../types';

interface MemeHistoryProps {
  history: GeneratedMeme[];
  onSelect: (meme: GeneratedMeme) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

const MemeHistory: React.FC<MemeHistoryProps> = ({ history, onSelect, onDelete, selectedId }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 px-4 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-4">
        <h3 className="text-2xl font-bold text-white">
          Creation History
        </h3>
        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full border border-gray-700 font-mono">
            {history.length} {history.length === 1 ? 'MEME' : 'MEMES'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {history.map((meme) => (
          <div 
            key={meme.id}
            onClick={() => onSelect(meme)}
            className={`
              cursor-pointer relative group rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:-translate-y-1 bg-gray-800
              ${selectedId === meme.id ? 'border-blue-500 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/50' : 'border-gray-800 hover:border-gray-600 hover:shadow-lg'}
            `}
          >
            {/* Aspect Ratio Container */}
            <div className="aspect-square relative w-full bg-black overflow-hidden">
                <img 
                  src={meme.imageUrl} 
                  alt={meme.topic} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                
                {/* Mini Text Overlay for Preview */}
                <div className="absolute top-2 left-0 right-0 px-2 text-center pointer-events-none">
                    <p className="font-meme text-white text-[10px] sm:text-xs leading-tight drop-shadow-md break-words">
                        {meme.topText}
                    </p>
                </div>
                <div className="absolute bottom-2 left-0 right-0 px-2 text-center pointer-events-none">
                    <p className="font-meme text-white text-[10px] sm:text-xs leading-tight drop-shadow-md break-words">
                        {meme.bottomText}
                    </p>
                </div>

                {/* Selection Overlay */}
                 {selectedId === meme.id && (
                    <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                 )}

                 {/* Delete Button */}
                 <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(meme.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110 z-20 shadow-lg"
                    title="Delete Meme"
                 >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                 </button>
            </div>

            {/* Meta Info */}
            <div className="p-3 border-t border-gray-700">
                <p className="text-gray-300 text-xs font-medium truncate" title={meme.topic}>
                    {meme.topic}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-gray-500 text-[10px]">
                      {new Date(meme.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {selectedId === meme.id && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemeHistory;