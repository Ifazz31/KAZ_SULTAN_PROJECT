import React, { useState } from 'react';

const ImageGenerationForm: React.FC = () => {
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [samplerSeed, setSamplerSeed] = useState<number | undefined>();
  const [samplerSteps, setSamplerSteps] = useState<number>(4); 
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('512x512'); 

  const sizes = ['256x256', '512x512', '1024x1024'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestData = {
      positive_prompt: positivePrompt,
      negative_prompt: negativePrompt,
      sampler_seed: samplerSeed,
      sampler_steps: samplerSteps,
      empty_latent_size: selectedSize, 
    };
    
    const response = await fetch('http://localhost:8000/trigger-workflow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const data = await response.json();
      setOutputImage(data.generated_image_url); 
    } else {
      console.error('Failed to generate image');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 font-sans">
      <h1 className="text-center text-3xl mb-6">Sultan Image Generator</h1>
      <div className="flex gap-6">
        {/* Input Section */}
        <form className="w-1/2 p-6 border border-gray-300 rounded-lg bg-gray-50" onSubmit={handleGenerate}>
          <h2 className="text-xl text-gray-800 mb-4">Input</h2>

          <label className="block mb-4">
            <span className="text-gray-700">Prompt</span>
            <input
              type="text"
              value={positivePrompt}
              onChange={(e) => setPositivePrompt(e.target.value)}
              placeholder="e.g., an astronaut on a horse in space"
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Negative Prompt</span>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g., blurry, low resolution"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <small className="text-gray-600">Specify things to avoid in the output image</small>
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Seed</span>
            <input
              type="number"
              value={samplerSeed || ''}
              onChange={(e) => setSamplerSeed(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Randomizes output when blank"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Steps</span>
            <input
              type="number"
              value={samplerSteps}
              onChange={(e) => setSamplerSteps(Number(e.target.value))}
              min="1"
              max="50"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <small className="text-gray-600">Controls the level of detail in the output</small>
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Size</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">Generate Image</button>
        </form>

        {/* Output Section */}
        <div className="w-1/2 p-6 border border-gray-300 rounded-lg bg-gray-50">
          <h2 className="text-xl text-gray-800 mb-4">Output</h2>
          {outputImage ? (
            <img src={outputImage} alt="Generated Output" className="w-full rounded-lg mt-4" />
          ) : (
            <p>No image generated yet.</p>
          )}
          <div className="flex justify-around mt-4">
            <button disabled={!outputImage} className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed">Share</button>
            <button disabled={!outputImage} className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationForm;
