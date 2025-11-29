def deduplicate_exact_match(latest: str, previous: str) -> str:
    if latest.strip() == "":
        return ""
    if previous.strip() == "":
        return latest
    length = 0
    for i in range(len(latest)):
        if previous.endswith(latest[:i]):
            length += i
    return latest[length:]

def consolidate_transcriptions(chunks: list[str]):
    init_text = chunks[0]
    for chunk in chunks[1:]:
        init_text += deduplicate_exact_match(chunk, init_text)
    return init_text