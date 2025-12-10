import React, { useRef, useState } from 'react';
import { GeneratedMeme } from '../types';
import Button from './Button';
import { downloadMeme } from '../utils/canvasUtils';

interface MemeDisplayProps {
  meme: GeneratedMeme;
  onRegenerate: () => void;
}

const MemeDisplay: React.FC<MemeDisplayProps> = ({ meme, onRegenerate }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadMeme(meme.imageUrl, meme.topText, meme.bottomText, `dev-meme-${meme.timestamp}.png`);
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to create download image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-700">
        {/* Meme Canvas Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black group">
           <img 
            src={meme.imageUrl} 
            alt="Meme Background" 
            className="w-full h-full object-cover"
          />
          
          {/* Top Text Overlay */}
          <div className="absolute top-4 left-0 right-0 px-4 text-center pointer-events-none">
            <h2 className="font-meme text-4xl md:text-5xl lg:text-6xl text-white break-words leading-tight">
              {meme.topText}
            </h2>
          </div>

          {/* Bottom Text Overlay */}
          <div className="absolute bottom-4 left-0 right-0 px-4 text-center pointer-events-none">
            <h2 className="font-meme text-4xl md:text-5xl lg:text-6xl text-white break-words leading-tight">
              {meme.bottomText}
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-gray-400 text-sm italic">
                Topic: "{meme.topic}"
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="secondary" onClick={onRegenerate} className="flex-1 sm:flex-none">
                    Try Again
                </Button>
                <Button onClick={handleDownload} isLoading={isDownloading} className="flex-1 sm:flex-none">
                    Download Image
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MemeDisplay;