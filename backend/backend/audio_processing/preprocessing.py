from pathlib import Path
import librosa
import soundfile as sf
from io import BytesIO
from typing import Optional

def prepare_audio(input_path:Path, output_path:Optional[Path]=None, target_sr:int=16000, return_array:bool=False):
    input_path = Path(input_path)

    # Handle file path
    if not input_path.exists():
        raise FileNotFoundError(f"File not found: {input_path}")

    # supported_formats = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.webm']
    # if input_path.suffix.lower() not in supported_formats:
    #     raise ValueError(f"Unsupported format: {input_path.suffix}. Supported formats are: {supported_formats}")

    y, sr = librosa.load(str(input_path), sr=None)
    if y is None:
        raise IOError("Failed to load file.")
    
    if output_path is None:
        output_path = input_path

    duration = len(y) / sr

    if sr != target_sr:
        y = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
        # print(f"   Resampled: {sr} Hz → {target_sr} Hz")

    # Normalize audio
    y = y / (max(abs(y)) + 1e-8)

    if return_array:
        print(f"Processed: numpy array ({duration:.1f}s)")
        return y
    else:
        # Save processed audio
        sf.write(output_path, y, target_sr)
        print(f"Saved: {output_path} ({duration:.1f}s)")
        return output_path