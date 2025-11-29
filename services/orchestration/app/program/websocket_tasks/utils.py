import hashlib
import json

def hash_value(data):
    return hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()