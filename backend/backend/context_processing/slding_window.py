class ConversationBuffer:
    def __init__(self, window_size=30):  # 30 seconds
        self.transcripts = []
        self.window_size = window_size
    
    def add_chunk(self, text, timestamp):
        self.transcripts.append((text, timestamp))
        # Keep only recent chunks
        cutoff = timestamp - self.window_size
        self.transcripts = [(t, ts) for t, ts in self.transcripts if ts > cutoff]
    
    def get_context(self):
        return " ".join([text for text, _ in self.transcripts])
