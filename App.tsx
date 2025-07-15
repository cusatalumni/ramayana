
import React, { useState, useCallback } from 'react';
import { addWatermark } from './services/geminiService';
import { PostData, DisplayablePost } from './types';
import Header from './components/Header';
import QuoteCard from './components/QuoteCard';
import ActionButtons from './components/ActionButtons';
import Loader from './components/Loader';
import { GenerateIcon } from './components/icons';

const App: React.FC = () => {
  const [post, setPost] = useState<DisplayablePost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldGenerateImage, setShouldGenerateImage] = useState<boolean>(true);

  const handleGeneratePost = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPost(null);

    try {
      // Step 1: Always fetch text and visual prompt
      const textResponse = await fetch('/api/generate-text', { method: 'POST' });
      if (!textResponse.ok) {
        const errorData = await textResponse.json().catch(() => ({ message: 'Failed to generate sloka text.' }));
        throw new Error(errorData.message || 'Failed to generate sloka text.');
      }
      const textData: PostData = await textResponse.json();
      
      // Display text immediately, noting if an image was requested
      setPost({ ...textData, imageUrl: null, imageRequested: shouldGenerateImage });

      if (shouldGenerateImage) {
        // Step 2: Fetch image only if toggle is on
        const imageResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visual_prompt: textData.visual_prompt })
        });
        if (!imageResponse.ok) {
            const errorData = await imageResponse.json().catch(() => ({ message: 'Failed to generate the image.' }));
            throw new Error(errorData.message || 'Failed to generate the image.');
        }
        const { rawImageUrl } = await imageResponse.json();

        // Step 3: Watermark and update state with the final image
        const watermarkedImageUrl = await addWatermark(rawImageUrl, "www.annapoornainfo.com");
        setPost(currentPost => currentPost ? { ...currentPost, imageUrl: watermarkedImageUrl } : null);
      }
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Post generation failed: ${errorMessage}`);
        setPost(null); // Clear partial post on error
    } finally {
        setIsLoading(false);
    }
  }, [shouldGenerateImage]);

  const getButtonText = () => {
    if (isLoading) {
      return shouldGenerateImage ? 'Generating Post...' : 'Generating Sloka...';
    }
    return shouldGenerateImage ? 'Generate Daily Post' : 'Generate Sloka (Text Only)';
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen text-stone-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <Header />

        <main className="mt-8">
          <div className="flex flex-col items-center mb-6">
              <div className={`flex items-center justify-center space-x-3 text-stone-600 mb-6 bg-amber-100/50 p-3 rounded-full border border-amber-200 transition-opacity ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <label htmlFor="image-toggle" className={`font-semibold pl-2 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Generate Post with Image</label>
                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="image-toggle" 
                    id="image-toggle" 
                    checked={shouldGenerateImage}
                    onChange={() => setShouldGenerateImage(!shouldGenerateImage)}
                    disabled={isLoading}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:cursor-not-allowed"
                    style={{top: '-0.25rem', left: '-0.25rem'}}
                  />
                  <label htmlFor="image-toggle" className={`toggle-label block overflow-hidden h-4 rounded-full bg-stone-300 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}></label>
                </div>
              </div>
              <p className="text-xs text-stone-500 -mt-2 mb-6 italic">(Image generation requires a billed Google API account)</p>

            <button
              onClick={handleGeneratePost}
              disabled={isLoading}
              className="font-cinzel text-lg inline-flex items-center gap-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:bg-gradient-to-br disabled:from-amber-300 disabled:to-orange-400 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? <Loader isButtonLoader={true} /> : <GenerateIcon />}
              {getButtonText()}
            </button>
          </div>

          {error && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {post && (
            <div className="mt-8 animate-fade-in">
              <QuoteCard {...post} />
              <ActionButtons {...post} />
              <div className="text-center mt-6 text-sm text-stone-600">
                <p>
                  ✨ To create this kind of Ramayana post with images visit{' '}
                  <a 
                    href="https://www.annapoornainfo.com/ramayana" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-amber-700 hover:underline font-semibold"
                  >
                    www.annapoornainfo.com/ramayana
                  </a>
                  {' '}now ✨
                </p>
              </div>
            </div>
          )}

           {!post && !isLoading && !error && (
            <div className="mt-12 text-center text-stone-500">
              <p className="text-lg">Set your options and click the button to generate your daily inspiration.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
