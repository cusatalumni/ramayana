
import React, { useState, useCallback } from 'react';
import { generateRamayanaPost } from './services/geminiService';
import { PostData } from './types';
import Header from './components/Header';
import QuoteCard from './components/QuoteCard';
import ActionButtons from './components/ActionButtons';
import Loader from './components/Loader';
import { GenerateIcon } from './components/icons';

const App: React.FC = () => {
  const [post, setPost] = useState<PostData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePost = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPost(null);

    try {
      const generatedPost = await generateRamayanaPost();
      setPost(generatedPost);
    } catch (err) {
      console.error(err);
      setError(
        'Failed to generate the post. The content may have been blocked or an API error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen text-stone-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <Header />

        <main className="mt-8">
          <div className="flex justify-center">
            {!isLoading && (
              <button
                onClick={handleGeneratePost}
                className="font-cinzel text-lg inline-flex items-center gap-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
              >
                <GenerateIcon />
                Generate Daily Post
              </button>
            )}
          </div>

          {isLoading && <Loader />}
          
          {error && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!isLoading && post && (
            <div className="mt-8 animate-fade-in">
              <QuoteCard 
                sanskrit_sloka={post.sanskrit_sloka}
                malayalam_transliteration={post.malayalam_transliteration}
                malayalam_meaning={post.malayalam_meaning}
                english_meaning={post.english_meaning}
                imageUrl={post.imageUrl} 
              />
              <ActionButtons 
                sanskrit_sloka={post.sanskrit_sloka}
                malayalam_transliteration={post.malayalam_transliteration}
                malayalam_meaning={post.malayalam_meaning}
                english_meaning={post.english_meaning}
                imageUrl={post.imageUrl} 
              />
              <div className="text-center mt-6 text-sm text-stone-600">
                <p>
                  ✨ To create this kind of Ramayana post with images visit{' '}
                  <a 
                    href="http://www.annapoornainfo.com/ramayana" 
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

           {!isLoading && !post && !error && (
            <div className="mt-12 text-center text-stone-500">
              <p className="text-lg">Click the button above to generate your daily inspiration from the Ramayana.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
