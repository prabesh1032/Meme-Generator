import React, { useState, useRef } from 'react';
import { GeneratedMeme, LoadingState, GenerationMode, MemeTemplate } from './types';
import { generateMemeContent, generateMemeImage } from './services/geminiService';
import MemeDisplay from './components/MemeDisplay';
import MemeHistory from './components/MemeHistory';
import Button from './components/Button';

const SUGGESTED_TOPICS = [
  "Production bug on Friday",
  "CSS centering div",
  "Git merge conflict",
  "It works on my machine",
  "Junior dev deleting database"
];

const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 't1',
    name: 'Frustrated Dev',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'A stressed person holding their head in hands, looking overwhelmed by a problem.'
  },
  {
    id: 't2',
    name: 'It Works!',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80',
    description: 'A person looking successful, happy, and confident.'
  },
  {
    id: 't3',
    name: 'Hacker Mode',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'A cool, dark matrix-style code background, representing serious hacking or complex backend.'
  },
  {
    id: 't4',
    name: 'Messy Cables',
    url: 'https://images.unsplash.com/photo-1558494949-efdeb6bf8d71?auto=format&fit=crop&w=800&q=80',
    description: 'A chaotic mess of server cables, representing spaghetti code or infrastructure disasters.'
  },
  {
    id: 't5',
    name: 'Dog Coder',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    description: 'A cute dog sitting in front of a laptop, acting like a developer who has no idea what they are doing.'
  },
  {
    id: 't6',
    name: 'Waiting Forever',
    url: 'https://images.unsplash.com/photo-1516139134453-745164295e9b?auto=format&fit=crop&w=800&q=80',
    description: 'A skeleton toy sitting on a chair, implying waiting an eternity for a build to finish or a page to load.'
  },
  {
    id: 't7',
    name: 'Pure Confusion',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    description: 'A blackboard full of complex mathematical equations, representing reading legacy code or understanding regex.'
  },
  {
    id: 't8',
    name: 'Production Fire',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'A high-rise building with a dramatic, chaotic vibe, representing a server crash or major production incident.'
  },
  {
    id: 't9',
    name: 'Caffeine Overload',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    description: 'A close-up of a strong cup of coffee, representing the fuel needed to survive a deadline.'
  }
];

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  
  // New State for Mode and Template
  const [mode, setMode] = useState<GenerationMode>('AI');
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);

  // Custom Upload State
  const [customTemplate, setCustomTemplate] = useState<MemeTemplate | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to store the history of generated memes
  const [history, setHistory] = useState<GeneratedMeme[]>([]);
  // State to track which meme is currently displayed
  const [selectedMemeId, setSelectedMemeId] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const activeMeme = selectedMemeId 
    ? history.find(m => m.id === selectedMemeId) 
    : history[0];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newTemplate: MemeTemplate = {
          id: 'custom',
          name: 'Custom Upload',
          url: result,
          description: 'User uploaded image'
        };
        setCustomTemplate(newTemplate);
        setSelectedTemplate(newTemplate);
        setCustomDescription('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (selectedTopic: string = topic) => {
    if (!selectedTopic.trim()) return;
    if (mode === 'TEMPLATE' && !selectedTemplate) {
      setError("Please select a template first.");
      return;
    }
    
    setError(null);
    setLoadingState(LoadingState.GENERATING_TEXT);
    
    // Deselect any history item
    setSelectedMemeId(null);

    try {
      // Step 1: Generate Text (passing template context if in template mode)
      let templateContext = undefined;
      
      if (mode === 'TEMPLATE' && selectedTemplate) {
        if (selectedTemplate.id === 'custom') {
            // Use user description if provided, otherwise generic
            templateContext = customDescription.trim() ? customDescription : "A generic funny image uploaded by the user";
        } else {
            templateContext = selectedTemplate.description;
        }
      }
      
      const content = await generateMemeContent(selectedTopic, templateContext);
      
      let imageUrl = '';
      
      if (mode === 'AI') {
        setLoadingState(LoadingState.GENERATING_IMAGE);
        // Step 2a: Generate AI Image
        imageUrl = await generateMemeImage(content.imagePrompt);
      } else {
        // Step 2b: Use Selected Template
        // Simulate a small delay for better UX flow
        await new Promise(r => setTimeout(r, 500));
        imageUrl = selectedTemplate!.url;
      }

      const newMeme: GeneratedMeme = {
        id: crypto.randomUUID(),
        imageUrl,
        topText: content.topText,
        bottomText: content.bottomText,
        timestamp: Date.now(),
        topic: selectedTopic
      };

      setHistory(prev => [newMeme, ...prev]);
      setLoadingState(LoadingState.COMPLETED);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong generating the meme.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSelectHistoryItem = (meme: GeneratedMeme) => {
    setSelectedMemeId(meme.id);
    setTopic(meme.topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  const isGenerating = loadingState === LoadingState.GENERATING_TEXT || loadingState === LoadingState.GENERATING_IMAGE;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8 space-y-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 tracking-tight cursor-default">
          DevMeme Gen
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Turn your coding trauma into comedy.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1 bg-gray-800 rounded-lg mb-8 border border-gray-700">
        <button
          onClick={() => setMode('AI')}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
            mode === 'AI' 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          🤖 AI Generation
        </button>
        <button
          onClick={() => setMode('TEMPLATE')}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
            mode === 'TEMPLATE' 
            ? 'bg-purple-600 text-white shadow-lg' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          🖼️ Template Mode
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-xl mb-12">
        
        {/* Template Selector Grid (Only in Template Mode) */}
        {mode === 'TEMPLATE' && (
          <div className="mb-8 animate-fade-in-up">
            <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-4">Select or Upload Template:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Upload Button */}
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 hover:bg-gray-800 cursor-pointer flex flex-col items-center justify-center transition-all group"
                  title="Upload your own image"
               >
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                  />
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-xs text-gray-400 group-hover:text-white font-bold uppercase transition-colors">Upload Own</span>
               </div>

               {/* Custom Template Display (if exists) */}
               {customTemplate && (
                 <div 
                   onClick={() => setSelectedTemplate(customTemplate)}
                   className={`
                     relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                     ${selectedTemplate?.id === 'custom' ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105' : 'border-gray-700 hover:border-gray-500'}
                   `}
                 >
                   <img src={customTemplate.url} alt="Custom" className="w-full h-full object-cover" />
                   <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-center">
                     <span className="text-xs text-white font-bold">Your Upload</span>
                   </div>
                 </div>
               )}

              {/* Predefined Templates */}
              {MEME_TEMPLATES.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                    ${selectedTemplate?.id === t.id ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105' : 'border-gray-700 hover:border-gray-500'}
                  `}
                >
                  <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-center">
                    <span className="text-xs text-white font-bold">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Description Input */}
            {selectedTemplate?.id === 'custom' && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-purple-500/30 animate-fade-in">
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2">
                        Describe your image for better AI captions (Optional):
                    </label>
                    <input 
                        type="text" 
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="e.g., A confused cat looking at a laptop"
                        className="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder-gray-600"
                    />
                </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${mode === 'AI' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'} rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}></div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Deploying to prod without testing'"
              className="relative w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg py-4 px-6 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xl"
              disabled={isGenerating}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-lg h-14"
            isLoading={isGenerating}
            variant={mode === 'TEMPLATE' ? 'primary' : 'primary'} // can customize color if needed
          >
             {loadingState === LoadingState.GENERATING_TEXT ? "Writing Punchlines..." : 
              loadingState === LoadingState.GENERATING_IMAGE ? "Painting the Scene..." : 
              mode === 'TEMPLATE' ? "Generate Meme Text" : "Generate Fully AI Meme"}
          </Button>
        </form>

        {/* Suggestions */}
        {history.length === 0 && !isGenerating && (
          <div className="mt-8 animate-fade-in-up">
            <p className="text-gray-500 text-sm mb-3 font-semibold uppercase tracking-wider text-center">Try these topics:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTopic(t);
                    handleGenerate(t);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 text-sm px-4 py-2 rounded-full border border-gray-700 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg max-w-xl w-full text-center animate-pulse">
          {error}
        </div>
      )}

      {/* Main Display Area */}
      {isGenerating ? (
        <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl border border-gray-700 animate-pulse flex flex-col items-center justify-center aspect-square text-gray-500 shadow-2xl">
           <svg className={`w-16 h-16 mb-4 animate-spin ${mode === 'TEMPLATE' ? 'text-purple-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <p className="text-xl font-medium">
             {loadingState === LoadingState.GENERATING_TEXT ? "Consulting the Meme Lords..." : "Applying to Template..."}
           </p>
        </div>
      ) : activeMeme ? (
        <MemeDisplay 
            meme={activeMeme} 
            onRegenerate={() => handleGenerate(activeMeme.topic)} 
        />
      ) : null}

      {/* History Grid */}
      <MemeHistory 
        history={history} 
        onSelect={handleSelectHistoryItem} 
        selectedId={activeMeme?.id}
      />

    </div>
  );
};

export default App;