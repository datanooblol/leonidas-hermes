import sys
import signal

# Fix signal.SIGKILL error on Windows
if sys.platform == "win32":
    signal.SIGKILL = signal.SIGTERM  # fallback

################################################

import nemo.collections.asr as nemo_asr
import torch

def load_model():
    # Select processing device
    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    print(f"🌪️ Loading Typhoon ASR model on {device.upper()}...")
    model = nemo_asr.models.ASRModel.from_pretrained(
        model_name="scb10x/typhoon-asr-realtime",
        map_location=device
    )
    if model is None:
        raise RuntimeError("Failed to load the ASR model.")
    return model