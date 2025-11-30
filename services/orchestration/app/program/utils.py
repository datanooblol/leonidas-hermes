import logging
import json
import os
from datetime import datetime
from pathlib import Path
from logging.handlers import RotatingFileHandler

# Create logs directory
logs_dir = Path("./logs")
logs_dir.mkdir(exist_ok=True)

class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging"""
    def format(self, record):
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'function': record.funcName,
            'line': record.lineno,
            'message': record.getMessage()
        }
        
        # Add extra data if provided
        if hasattr(record, 'extra_data'):
            log_data.update(getattr(record, 'extra_data', {}))
            
        return json.dumps(log_data, ensure_ascii=False)

def setup_logger(level=logging.DEBUG):
    log_dir = Path("./logs")
    log_dir.mkdir(exist_ok=True, parents=True)

    # Create timestamp for log file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = log_dir / f"orchestration_{timestamp}.log"    

    # File handler (new)
    file_handler = logging.FileHandler(log_file)
    # file_handler.setFormatter(logging.Formatter(
    #     '%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s'
    # ))
    file_handler.setFormatter(JSONFormatter())
    
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s'
    ))
    
    # Setup root logger
    logging.basicConfig(
        level=level,
        handlers=[console_handler, file_handler],
        force=True
    )
    
    # Silence noisy third-party libraries
    logging.getLogger('botocore').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('boto3').setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("pydub.converter").setLevel(logging.WARNING)
    logging.getLogger('asyncio').setLevel(logging.WARNING)
    
    print("✅ Development logging enabled (DEBUG level) - Console")