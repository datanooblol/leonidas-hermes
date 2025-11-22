import re
import asyncio
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class TranscriptionResult:
    text: str
    confidence: float
    model: str

class ThaiInsuranceCorrectionPipeline:
    def __init__(self):
        self.buffer = ""
        
        # Basic Thai insurance dictionary
        self.insurance_dict = {
            # Common transcription errors -> correct terms
            'ประกัน ภัย': 'ประกันภัย',
            'ประกัน ชีวิต': 'ประกันชีวิต', 
            'เบี้ย ประกัน': 'เบี้ยประกัน',
            'ผู้ รับ ผลประโยชน์': 'ผู้รับผลประโยชน์',
            'ทุน ประกัน': 'ทุนประกัน',
            'กรม ธรรม์': 'กรมธรรม์',
            'ค่า สิน ไหม': 'ค่าสินไหม',
            'วง เงิน': 'วงเงิน',
            
            # Numbers often misheard
            'หนึ่ง แสน': '100,000',
            'สอง แสน': '200,000',
            'ห้า แสน': '500,000',
            'หนึ่ง ล้าน': '1,000,000',
        }
        
        # Context-based corrections
        self.context_rules = {
            'ประกัน': ['ชีวิต', 'รถยนต์', 'สุขภาพ', 'อุบัติเหตุ'],
            'เบี้ย': ['รายเดือน', 'รายปี', 'ครั้งเดียว'],
            'ความคุ้มครอง': ['วงเงิน', 'ระยะเวลา', 'เงื่อนไข']
        }
    
    def basic_cleanup(self, text: str) -> str:
        """Stage 1: Immediate fixes"""
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Apply dictionary corrections
        for wrong, right in self.insurance_dict.items():
            text = text.replace(wrong, right)
        
        return text
    
    def context_correct(self, sentence: str) -> str:
        """Stage 2: Context-aware corrections"""
        # If talking about insurance + money, likely discussing premiums
        if 'ประกัน' in sentence and any(num in sentence for num in ['บาท', 'แสน', 'ล้าน']):
            sentence = sentence.replace('เบี้ย', 'เบี้ยประกัน')
        
        # If mentioning coverage + amount, format properly
        if 'ความคุ้มครอง' in sentence and 'บาท' in sentence:
            sentence = re.sub(r'(\d+)\s*บาท', r'\1 บาท', sentence)
        
        return sentence
    
    def process_chunk(self, raw_text: str) -> str:
        """Main processing pipeline"""
        # Stage 1: Basic cleanup
        cleaned = self.basic_cleanup(raw_text)
        
        # Stage 2: Buffer for context
        self.buffer += cleaned + " "
        
        # Stage 3: Apply context corrections at sentence end
        if any(end in cleaned for end in ['.', 'ครับ', 'ค่ะ', '?']) or len(self.buffer) > 50:
            corrected = self.context_correct(self.buffer.strip())
            self.buffer = ""
            return corrected
        
        return cleaned

# Mock STT functions for testing
async def whisper_transcribe(audio) -> TranscriptionResult:
    return TranscriptionResult("ผม สนใจ ประกัน ชีวิต วง เงิน หนึ่ง ล้าน บาท ครับ", 0.85, "whisper")

async def google_transcribe(audio) -> TranscriptionResult:
    return TranscriptionResult("ผมสนใจประกันชีวิตวงเงิน 1000000 บาทครับ", 0.92, "google")

async def ensemble_transcribe(audio_chunk):
    """Multi-model ensemble"""
    tasks = [
        whisper_transcribe(audio_chunk),
        google_transcribe(audio_chunk)
    ]
    
    results = await asyncio.gather(*tasks)
    
    # Pick highest confidence
    best = max(results, key=lambda x: x.confidence)
    return best.text

# Test the system
async def test_pipeline():
    pipeline = ThaiInsuranceCorrectionPipeline()
    
    # Simulate real-time transcription chunks
    test_chunks = [
        "ผม สนใจ ประกัน ภัย",
        "วง เงิน หนึ่ง แสน บาท", 
        "เบี้ย รายเดือน เท่าไหร่ ครับ"
    ]
    
    print("=== Testing Correction Pipeline ===")
    for chunk in test_chunks:
        result = pipeline.process_chunk(chunk)
        print(f"Input:  {chunk}")
        print(f"Output: {result}")
        print()
    
    print("=== Testing Ensemble ===")
    audio_mock = "mock_audio_data"
    ensemble_result = await ensemble_transcribe(audio_mock)
    final_result = pipeline.process_chunk(ensemble_result)
    print(f"Ensemble: {ensemble_result}")
    print(f"Final:    {final_result}")

# Run the test
if __name__ == "__main__":
    asyncio.run(test_pipeline())
