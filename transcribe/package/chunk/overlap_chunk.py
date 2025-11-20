from pydub import AudioSegment

def merge_audio_with_overlap(file1_path:str, file2_path:str, output_path:str, overlap:int=0.5):
    """Merge two audio files with overlap from the end of the first file.
    
    Args:
        file1_path (str): Path to the first audio file
        file2_path (str): Path to the second audio file  
        output_path (str): Path for the merged output file
        overlap (int): Overlap duration in seconds (default: 0.5)
        
    Returns:
        str: Path to the merged audio file
    """
    audio1 = AudioSegment.from_wav(file1_path)
    audio2 = AudioSegment.from_wav(file2_path)
    
    overlap*=1000  # Convert to milliseconds
    audio1_overlap = audio1[-overlap:]
    
    # Merge overlap from end of first file + second file
    merged_audio = audio1_overlap + audio2
    
    # Export the result file
    merged_audio.export(output_path, format="wav")
    
    print(f"✅ Merged {overlap/1000}s from end of {file1_path} + {file2_path} to {output_path}")
    return output_path