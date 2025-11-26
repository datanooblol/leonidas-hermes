from pydub import AudioSegment
from pathlib import Path
import tempfile
import time
from backend.audio_processing.preprocessing import prepare_audio
from backend.audio_processing.load_model import load_model

model = load_model()

class Overlap2Transcribe:
    def __init__(self):
        self.temp_dir = Path("./temp_dir")
        self.temp_dir.mkdir(exist_ok=True, parents=True)
        self.model = model

    def merge_audio_with_overlap(self, latest_path:str, previous_path:str, overlap:float=1):
        """Merge two audio files with overlap from the end of the first file.
        
        Args:
            latest_path (str): Path to the latest audio file
            previous_path (str): Path to the previous audio file  
            overlap (float): Overlap duration in seconds (default: 0.5)
            
        Returns:
            str: Path to the merged audio file
        """
        audio1 = AudioSegment.from_wav(previous_path)
        audio2 = AudioSegment.from_wav(latest_path)
        
        overlap*=1000  # Convert to milliseconds
        audio1_overlap = audio1[-overlap:]
        
        # Merge overlap from end of first file + second file
        merged_audio = audio1_overlap + audio2
        return merged_audio

    def transcribe(self, audio):
        with tempfile.TemporaryDirectory(dir=self.temp_dir) as tmpdir:
            file_path = Path(tmpdir) / "audio.wav"
            audio.export(file_path, format="wav")
            # prep_path = prepare_audio(file_path)
            transcriptions = model.transcribe(audio=[str(file_path)])
            # time.sleep(2)
            return transcriptions[0].text if transcriptions else ""

    def run(self, chunks:list, overlap=0.5):
        if len(chunks)>1:
            latest_path = chunks[0].audio_path
            previous_path = chunks[1].audio_path
            audio = self.merge_audio_with_overlap(latest_path, previous_path, overlap)
            return self.transcribe(audio)
        audio = AudioSegment.from_wav(chunks[0].audio_path)
        return self.transcribe(audio)