import requests
class LocalEmbedding:
    def __init__(self, model_name):
        self.model_name = model_name
        self.base_url = f"http://localhost:11434/api/embed"

    def run(self, texts:list):
        response = requests.post(self.base_url, json={"model": self.model_name, "input": texts})
        return response.json()