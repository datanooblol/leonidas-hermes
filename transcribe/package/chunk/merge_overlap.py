from rapidfuzz import fuzz

def merge_overlapped_text(texts:list) -> str:
    """Merge overlapped text segments by finding exact matches.
    
    Args:
        texts (list): List of text segments to merge
        
    Returns:
        str: Merged text with overlaps removed
    """
    if not texts:
        return ""
    
    merged = texts[0]
    
    for i in range(1, len(texts)):
        current = texts[i]
        if not current:
            continue
            
        # Find overlapping part between end of merged and start of current
        best_overlap = 0
        for j in range(1, min(len(merged), len(current)) + 1):
            if merged[-j:] == current[:j]:
                best_overlap = j
        
        # Merge by removing the overlapping part
        merged += current[best_overlap:]
    
    return merged

def merge_overlapped_text_fuzzy(texts:list, threshold:int=85) -> str:
    """Merge overlapped text segments using fuzzy matching.
    
    Args:
        texts (list): List of text segments to merge
        threshold (int): Similarity threshold for fuzzy matching (default: 85)
        
    Returns:
        str: Merged text with fuzzy overlaps removed
    """
    if not texts:
        return ""

    merged = texts[0]

    for i in range(1, len(texts)):
        current = texts[i]
        if not current:
            continue

        best_overlap = 0
        max_len = min(len(merged), len(current))

        for j in range(1, max_len + 1):
            tail = merged[-j:]
            head = current[:j]

            # Use fuzzy ratio instead of exact match
            similarity = fuzz.ratio(tail, head)
            if similarity >= threshold:  
                best_overlap = j

        merged += current[best_overlap:]

    return merged