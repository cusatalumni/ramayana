
// The core data returned from the first API call (text generation)
export interface PostData {
  sanskrit_sloka: string;
  malayalam_transliteration: string;
  malayalam_meaning: string;
  english_meaning: string;
  visual_prompt: string; // The prompt to generate the image
}

// The data structure used for rendering in the components.
// The image can be temporarily null while it's being generated.
export interface DisplayablePost extends PostData {
  imageUrl: string | null;
}
