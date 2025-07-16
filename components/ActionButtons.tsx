import React, { useState } from 'react';
import { CopyIcon, DownloadIcon } from './icons';
import { DisplayablePost } from '../types';

const ActionButtons: React.FC<DisplayablePost> = ({ sanskrit_sloka, malayalam_transliteration, malayalam_meaning, english_meaning, imageUrl, imageRequested }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `
Sloka (Sanskrit):
${sanskrit_sloka}

Transliteration (Malayalam):
${malayalam_transliteration}

Malayalam Meaning:
${malayalam_meaning}

English Meaning:
“${english_meaning}”

— The Ramayana
✨ To create this kind of Ramayana post with images visit www.annapoornainfo.com/ramayana now ✨
    `;
    try {
      await navigator.clipboard.writeText(textToCopy.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy sloka.');
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ramayana_post.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
      <button
        onClick={handleCopy}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-700 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-stone-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
      >
        <CopyIcon />
        {copied ? 'Copied!' : 'Copy Sloka'}
      </button>
      {imageRequested && (
        <button
          onClick={handleDownload}
          disabled={!imageUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-amber-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed"
        >
          <DownloadIcon />
          Download Image
        </button>
      )}
    </div>
  );
};

export default ActionButtons;