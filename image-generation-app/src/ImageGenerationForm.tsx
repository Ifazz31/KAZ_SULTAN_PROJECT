import React, { useState, useEffect } from 'react';
import './App.css';

const ImageGenerationForm: React.FC = () => {
  const [positivePrompt, setPositivePrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [samplerSeed, setSamplerSeed] = useState<number | null>(null);
  const [samplerSteps, setSamplerSteps] = useState<number>(4);
  const [samplerCfg, setSamplerCfg] = useState<number>(7.5); 
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('512x512');
  const [selectedScheduler, setSelectedScheduler] = useState<string>('normal');
  const [progress, setProgress] = useState<number>(0); 

  const sizes = ['256x256', '512x512', '1024x1024'];
  const schedulers = ['normal', 'karras', 'exponential', 'sgm_uniform', 'simple', 'beta'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = {
      positive_prompt: positivePrompt,
      negative_prompt: negativePrompt,
      sampler_seed: samplerSeed,
      sampler_steps: samplerSteps,
      sampler_cfg: samplerCfg,
      empty_latent_size: selectedSize,
      sampler_scheduler: selectedScheduler,
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
      console.error('Failed to generate image, Status:', response.status);
    }
  };

  const connectWebSocket = () => {
    const socket = new WebSocket('ws://localhost:8188'); 

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'progress') {
        setProgress(message.data.progress); 
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  };

  useEffect(() => {
    connectWebSocket(); 
  }, []);

  return (
    <div className="container flex flex-col items-center h-screen w-full bg-white">
      <h1 className="text-center text-2xl font-bold mb-5">Sultan Image Generator</h1>
      <div className="grid gap-4 lg:grid-cols-2 w-full max-w-full flex-grow">
        <form className="bg-gray-100 p-5 rounded-lg shadow-md flex-grow" onSubmit={handleGenerate}>
          <h2 className="text-xl font-semibold mb-4">Input</h2>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Prompt</span>
            <input
              type="text"
              value={positivePrompt}
              onChange={(e) => setPositivePrompt(e.target.value)}
              placeholder="e.g., an astronaut on a horse in space"
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Negative Prompt</span>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g., blurry, low resolution"
              className="w-full mt-1 p-2 border rounded"
            />
            <small className="text-gray-500">Specify things to avoid in the output image</small>
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Seed</span>
            <input
              type="number"
              value={samplerSeed ?? ''} 
              onChange={(e) => setSamplerSeed(e.target.value ? Number(e.target.value) : null)}
              placeholder="Randomizes output when blank"
              className="w-full mt-1 p-2 border rounded"
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Steps</span>
            <input
              type="number"
              value={samplerSteps}
              onChange={(e) => setSamplerSteps(Number(e.target.value))}
              min="1"
              max="50"
              className="w-full mt-1 p-2 border rounded"
            />
            <small className="text-gray-500">Controls the level of detail in the output</small>
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">CFG (Guidance Scale)</span>
            <input
              type="number"
              value={samplerCfg}
              onChange={(e) => setSamplerCfg(Number(e.target.value))}
              min="1"
              max="20"
              className="w-full mt-1 p-2 border rounded"
            />
            <small className="text-gray-500">Adjusts the influence of the prompt on the output</small>
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Size</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Scheduler</span>
            <select
              value={selectedScheduler}
              onChange={(e) => setSelectedScheduler(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            >
              {schedulers.map((scheduler) => (
                <option key={scheduler} value={scheduler}>
                  {scheduler}
                </option>
              ))}
            </select>
          </label>
        </form>

        <div className="bg-gray-100 p-5 rounded-lg shadow-md flex-grow relative">
          <button
            onClick={handleGenerate}
            className="absolute top-4 right-8 w-20 h-12 bg-blue-500 text-black rounded-md flex items-center justify-center text-lg font-bold hover:bg-blue-600"
          >
            Generate
          </button>

          <h2 className="text-xl font-semibold mt-32 mb-4">Output</h2>

          {outputImage ? (
            <img src={outputImage} alt="Generated Output" className="w-full rounded-md mt-4" />
          ) : (
            <p className="text-gray-500">No image generated yet.</p>
          )}

          <div className="output-actions flex justify-around mt-4">
            <button className="p-2 bg-gray-300 rounded-md" disabled={!outputImage}>Share</button>
            <button className="p-2 bg-gray-300 rounded-md" disabled={!outputImage}>Download</button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-6 mt-10">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress > 0 && (
            <p className="text-center text-sm mt-2">{`Progress: ${progress}%`}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationForm;
