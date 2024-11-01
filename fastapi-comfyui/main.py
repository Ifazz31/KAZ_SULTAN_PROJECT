import uuid
import json
import urllib.request
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

comfyui_server_address = "127.0.0.1:8188"
client_id = str(uuid.uuid4())

class RequestParams(BaseModel):
    positive_prompt: str
    negative_prompt: str
    sampler_seed: int
    sampler_steps: int
    sampler_cfg: float
    empty_latent_size: str
    sampler_scheduler: str

@app.post("/trigger-workflow/")
async def trigger_workflow(request_params: RequestParams):
    try:
        positive_prompt = request_params.positive_prompt
        negative_prompt = request_params.negative_prompt
        sampler_seed = request_params.sampler_seed
        sampler_steps = request_params.sampler_steps
        sampler_cfg = request_params.sampler_cfg
        empty_latent_size = request_params.empty_latent_size
        sampler_scheduler = request_params.sampler_scheduler
        width, height = map(int, empty_latent_size.split('x'))

        prompt = {
            "prompt": {
                "3": {
                    "inputs": {
                        "seed": sampler_seed,
                        "steps": sampler_steps,
                        "cfg": sampler_cfg,
                        "sampler_name": "euler",
                        "scheduler": sampler_scheduler,
                        "denoise": 1,
                        "model": ["4", 0],
                        "positive": ["6", 0],
                        "negative": ["7", 0],
                        "latent_image": ["5", 0],
                    },
                    "class_type": "KSampler",
                    "_meta": {"title": "KSampler"},
                },
                "4": {
                    "inputs": {
                        "ckpt_name": "prefectPonyXL_v3.safetensors"
                    },
                    "class_type": "CheckpointLoaderSimple",
                    "_meta": {"title": "Load Checkpoint"},
                },
                "5": {
                    "inputs": {
                        "width": width,
                        "height": height,
                        "batch_size": 1
                    },
                    "class_type": "EmptyLatentImage",
                    "_meta": {"title": "Empty Latent Image"},
                },
                "6": {
                    "inputs": {
                        "text": positive_prompt,
                        "clip": ["4", 1],
                    },
                    "class_type": "CLIPTextEncode",
                    "_meta": {"title": "CLIP Text Encode (Prompt)"},
                },
                "7": {
                    "inputs": {
                        "text": negative_prompt,
                        "clip": ["4", 1],
                    },
                    "class_type": "CLIPTextEncode",
                    "_meta": {"title": "CLIP Text Encode (Negative Prompt)"},
                },
                "8": {
                    "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
                    "class_type": "VAEDecode",
                    "_meta": {"title": "VAE Decode"},
                },
                "9": {
                    "inputs": {"filename_prefix": "ComfyUI", "images": ["8", 0]},
                    "class_type": "SaveImage",
                    "_meta": {"title": "Save Image"},
                },
            },
            "client_id": client_id,
            "last_node": "9"
        }

        data = json.dumps(prompt).encode("utf-8")
        req = urllib.request.Request(
            f"http://{comfyui_server_address}/prompt", data=data, method="POST",
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req) as response:
            result = response.read().decode("utf-8")
            result_json = json.loads(result)
            
            print("ComfyUI response:", json.dumps(result_json, indent=2))

            
            image_url = result_json.get("image_url")  

            return JSONResponse(content={
                "message": "Workflow triggered successfully",
                "image_url": image_url,  
            })

    except Exception as e:
        print("Error triggering workflow:", str(e))
        return JSONResponse(
            status_code=500, content={"message": f"Error triggering workflow: {str(e)}"}
        )
