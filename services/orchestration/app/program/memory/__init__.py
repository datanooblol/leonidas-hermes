# __init__.py - Memory package factory and backend management

import os
from typing import List
from .interfaces import MemoryBackend

class MemoryFactory:
    """Factory class for creating and managing memory backends"""
    
    @classmethod
    def list_available_backends(cls) -> List[str]:
        """List all available backend implementations"""
        backend_catalog_path = os.path.join(os.path.dirname(__file__), 'backend_catalog')
        backends = []
        
        if os.path.exists(backend_catalog_path):
            for item in os.listdir(backend_catalog_path):
                item_path = os.path.join(backend_catalog_path, item)
                if os.path.isdir(item_path) and not item.startswith('__'):
                    backends.append(item)
        
        return sorted(backends)
    
    @classmethod
    def create_backend(cls, backend_name: str, **kwargs) -> MemoryBackend:
        """Create a memory backend instance"""
        available_backends = cls.list_available_backends()
        
        if backend_name not in available_backends:
            raise ValueError(f"Backend '{backend_name}' not available. Available backends: {available_backends}")
        
        if backend_name == "duckdb":
            from .backend_catalog.duckdb.manager import DuckDBManager
            return DuckDBManager(**kwargs)
        
        raise NotImplementedError(f"Backend '{backend_name}' is not implemented yet")

# Convenience functions
def list_available_backends() -> List[str]:
    """List all available backend implementations"""
    return MemoryFactory.list_available_backends()

def create_memory_backend(backend_name: str, **kwargs) -> MemoryBackend:
    """Create a memory backend instance"""
    return MemoryFactory.create_backend(backend_name, **kwargs)