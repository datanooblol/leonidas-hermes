import time
from package.typhoon.preprocessing import prepare_audio
from package.typhoon.load_model import load_model
import soundfile as sf

class TyphoonASR:
    def __init__(self):
        self.model = load_model()
    
    def preprocess(self, input_path, output_path=None, target_sr=16000):
        return prepare_audio(input_path, output_path, target_sr)
    
    def get_info(self, audio):
        audio_info = sf.info(audio)
        audio_duration = audio_info.duration
        # rtf = processing_time / audio_duration
        return dict(
            info=audio_info,
            duration=audio_duration,
            # rtf=rtf
        )
    
    def transcribe(self, audio, with_timestamps=False):
        info = self.get_info(audio)
        start_time = time.time()
        
        if with_timestamps:
            hypotheses = self.model.transcribe(audio=[audio], return_hypotheses=True)
            processing_time = time.time() - start_time
            
            transcription = ""
            if hypotheses and len(hypotheses) > 0 and hasattr(hypotheses[0], 'text'):
                transcription = hypotheses[0].text
            
            timestamps = []
            if transcription and info['duration'] > 0:
                words = transcription.split()
                if len(words) > 0:
                    avg_duration = info['duration'] / len(words)
                    for i, word in enumerate(words):
                        timestamps.append({
                            'word': word,
                            'start': i * avg_duration,
                            'end': (i + 1) * avg_duration
                        })
            
            return dict(
                text=transcription,
                timestamps=timestamps,
                processing_time=processing_time,
                info=info
            )
        else:
            response = self.model.transcribe(audio=[audio])
            processing_time = time.time() - start_time
            return dict(
                text=response[0] if response else "",
                processing_time=processing_time,
                info=info
            )