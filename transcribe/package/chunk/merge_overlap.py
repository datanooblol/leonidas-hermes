from rapidfuzz import fuzz

def merge_overlapped_text(texts:list) -> str:
    if not texts:
        return ""
    
    merged = texts[0]
    
    for i in range(1, len(texts)):
        current = texts[i]
        if not current:
            continue
            
        # หาส่วนที่ซ้ำกันระหว่างท้าย merged กับต้น current
        best_overlap = 0
        for j in range(1, min(len(merged), len(current)) + 1):
            if merged[-j:] == current[:j]:
                best_overlap = j
        
        # รวมโดยตัดส่วนที่ซ้ำออก
        merged += current[best_overlap:]
    
    return merged

def merge_overlapped_text_fuzzy(texts:list, threshold:int=85) -> str:
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

            # ใช้ fuzzy ratio แทน exact match
            similarity = fuzz.ratio(tail, head)
            if similarity >= threshold:  
                best_overlap = j

        merged += current[best_overlap:]

    return merged