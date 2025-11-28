from pydub import AudioSegment
from pathlib import Path
import tempfile
from io import BytesIO
from typing import List
from asr.audio_processing.preprocessing import prepare_audio

class TranscriptionEngine:
    def __init__(self, model):
        self.temp_dir = Path("/app/temp_dir")
        self.temp_dir.mkdir(exist_ok=True, parents=True)
        self.model = model

    def transcribe(self, audio_bytes:bytes):
        audio_seg = AudioSegment.from_file(BytesIO(audio_bytes))
        with tempfile.TemporaryDirectory(dir=self.temp_dir) as tmpdir:
            file_path = Path(tmpdir) / "audio.wav"
            audio_seg.export(file_path, format="wav")
            file_path = prepare_audio(file_path)
            transcriptions = self.model.transcribe(audio=[str(file_path)])
            # time.sleep(2)
            return transcriptions[0].text if transcriptions else ""

    def run(self, audio_chunks:List[bytes], normalize=False, with_timestamps:bool=False):
        if len(audio_chunks) == 1:
            audio_bytes = audio_chunks[0]
            return self.transcribe(audio_bytes)
        return {}