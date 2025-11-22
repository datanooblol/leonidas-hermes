from pydub import AudioSegment

def merge_audio_with_overlap(latest_path:str, previous_path:str, output_path:str, overlap:int=0.5):
    """Merge two audio files with overlap from the end of the first file.
    
    Args:
        latest_path (str): Path to the latest audio file
        previous_path (str): Path to the previous audio file  
        output_path (str): Path for the merged output file
        overlap (int): Overlap duration in seconds (default: 0.5)
        
    Returns:
        str: Path to the merged audio file
    """
    audio1 = AudioSegment.from_wav(previous_path)
    audio2 = AudioSegment.from_wav(latest_path)
    
    overlap*=1000  # Convert to milliseconds
    audio1_overlap = audio1[-overlap:]
    
    # Merge overlap from end of first file + second file
    merged_audio = audio1_overlap + audio2
    
    # Export the result file
    merged_audio.export(output_path, format="wav")
    
    print(f"✅ Merged {overlap/1000}s from end of {previous_path} + {latest_path} to {output_path}")
    return output_path