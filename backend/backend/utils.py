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
            
        return json.dumps(log_data)

def setup_logger(level=logging.DEBUG):
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s'
    ))
    
    # Setup root logger
    logging.basicConfig(
        level=level,
        handlers=[console_handler],
        force=True
    )
    
    # Silence noisy third-party libraries
    logging.getLogger('botocore').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('boto3').setLevel(logging.WARNING)
    
    print("✅ Development logging enabled (DEBUG level) - Console + logs/development.log")

def setup_development_log():
    """Setup logging for development - see everything"""
    # Console handler with detailed format
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s'
    ))
    
    # File handler with JSON format
    file_handler = RotatingFileHandler(
        logs_dir / 'development.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=3
    )
    file_handler.setFormatter(JSONFormatter())
    
    # Setup root logger
    logging.basicConfig(
        level=logging.DEBUG,
        handlers=[console_handler, file_handler],
        force=True
    )
    
    # Silence noisy third-party libraries
    logging.getLogger('botocore').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('boto3').setLevel(logging.WARNING)
    
    print("✅ Development logging enabled (DEBUG level) - Console + logs/development.log")

def setup_production_log():
    """Setup logging for production - clean logs only"""
    # Console handler with simple format
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    ))
    
    # File handler with JSON format for analysis
    file_handler = RotatingFileHandler(
        logs_dir / 'production.log',
        maxBytes=50*1024*1024,  # 50MB
        backupCount=10
    )
    file_handler.setFormatter(JSONFormatter())
    
    # Error file handler
    error_handler = RotatingFileHandler(
        logs_dir / 'errors.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(JSONFormatter())
    
    # Setup root logger
    logging.basicConfig(
        level=logging.INFO,
        handlers=[console_handler, file_handler, error_handler],
        force=True
    )
    
    # Silence third-party libraries
    logging.getLogger('botocore').setLevel(logging.ERROR)
    logging.getLogger('urllib3').setLevel(logging.ERROR)
    logging.getLogger('boto3').setLevel(logging.ERROR)
    
    print("✅ Production logging enabled (INFO level) - Console + logs/production.log + logs/errors.log")

def setup_testing_log():
    """Setup logging for testing - verbose but not overwhelming"""
    # Console handler only for testing
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(levelname)s - %(name)s - %(funcName)s - %(message)s'
    ))
    
    # Optional file handler for test logs
    file_handler = RotatingFileHandler(
        logs_dir / 'testing.log',
        maxBytes=5*1024*1024,  # 5MB
        backupCount=2
    )
    file_handler.setFormatter(JSONFormatter())
    
    # Setup root logger
    logging.basicConfig(
        level=logging.INFO,
        handlers=[console_handler, file_handler],
        force=True
    )
    
    # Silence third-party libraries
    logging.getLogger('botocore').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('boto3').setLevel(logging.WARNING)
    
    print("✅ Testing logging enabled (INFO level) - Console + logs/testing.log")

def setup_auto_log():
    """Auto-detect environment and setup appropriate logging"""
    env = os.getenv('ENV', 'development')
    
    if env == 'production':
        setup_production_log()
    elif env == 'testing':
        setup_testing_log()
    else:
        setup_development_log()

def silence_third_party_logs():
    """Silence noisy third-party library logs"""
    noisy_loggers = [
        'botocore', 'boto3', 'urllib3', 'requests', 'httpx',
        'asyncio', 'websockets', 'aiohttp'
    ]
    
    for logger_name in noisy_loggers:
        logging.getLogger(logger_name).setLevel(logging.WARNING)

# Helper function for structured logging
def log_with_data(logger, level, message, **kwargs):
    """Helper to log with structured data"""
    getattr(logger, level)(message, extra={'extra_data': kwargs})

def get_clean_logger(name):
    """Get a logger with third-party noise silenced"""
    logger = logging.getLogger(name)
    silence_third_party_logs()
    return logger

# Example usage functions
def log_audio_processing(logger, session_id, audio_shape, duration):
    """Example: Log audio processing with structured data"""
    logger.info("Audio processing started", extra={
        'extra_data': {
            'session_id': session_id,
            'audio_shape': audio_shape,
            'duration': duration
        }
    })

def log_transcription_result(logger, session_id, result_length, processing_time):
    """Example: Log transcription result with structured data"""
    logger.info("Transcription completed", extra={
        'extra_data': {
            'session_id': session_id,
            'result_length': result_length,
            'processing_time': processing_time
        }
    })

def inspect_log_attributes():
    """Returns all available LogRecord attributes for creating custom log formats"""
    import logging
    
    # Create a sample log record
    log_record = logging.LogRecord(
        name='test_logger',
        level=logging.INFO,
        pathname='/app/backend/test.py',
        lineno=42,
        msg='Test message',
        args=(),
        exc_info=None
    )
    
    # Get all non-private, non-callable attributes
    attributes = {}
    for attr in dir(log_record):
        if not attr.startswith('_'):
            try:
                value = getattr(log_record, attr)
                if not callable(value):
                    attributes[attr] = {
                        'value': value,
                        'type': type(value).__name__,
                        'format_string': f'%({attr})s'
                    }
            except:
                pass
    
    # Print organized results
    print("\n" + "="*60)
    print("AVAILABLE LOGRECORD ATTRIBUTES FOR CUSTOM FORMATTERS")
    print("="*60)
    
    categories = {
        'Time Related': ['created', 'msecs', 'relativeCreated'],
        'Level Info': ['levelname', 'levelno'],
        'Location Info': ['name', 'module', 'filename', 'pathname', 'funcName', 'lineno'],
        'Process/Thread': ['process', 'processName', 'thread', 'threadName'],
        'Message Info': ['msg', 'message', 'args'],
        'Exception Info': ['exc_info', 'exc_text', 'stack_info']
    }
    
    for category, attrs in categories.items():
        print(f"\n{category}:")
        print("-" * len(category))
        for attr in attrs:
            if attr in attributes:
                info = attributes[attr]
                print(f"  {attr:15} | {info['type']:10} | {info['format_string']:15} | {info['value']}")
    
    print(f"\nUsage Examples:")
    print("-" * 15)
    print("# Basic: format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'")
    print("# Detailed: format='%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s'")
    print("# Full: format='%(asctime)s - %(processName)s[%(process)d] - %(name)s - %(filename)s:%(lineno)d - %(levelname)s - %(message)s'")
    print("\n" + "="*60)
    
    return attributes
