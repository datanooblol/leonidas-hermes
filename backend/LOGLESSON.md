# Python Logging Lesson

## Table of Contents

1. [Basic Setup](#1-basic-setup)
2. [Log Levels - When to Use What](#2-log-levels---when-to-use-what)
3. [Separate Loggers for Each Process](#3-separate-loggers-for-each-process)
4. [Format String Variables](#4-format-string-variables)
5. [Real-World Example for Transcription App](#5-real-world-example-for-transcription-app)
6. [Quick Reference](#6-quick-reference)
7. [Logging Utility Functions](#7-logging-utility-functions)
8. [OOP vs Function-Based Logging Patterns](#8-oop-vs-function-based-logging-patterns)
9. [Asyncio and Threading Considerations](#9-asyncio-and-threading-considerations)
10. [Tips](#10-tips)
11. [Pros and Cons of Logging](#11-pros-and-cons-of-logging)
12. [Inspecting LogRecord Attributes](#12-inspecting-logrecord-attributes)

## 1. Basic Setup

### One-time global setup (in main.py):
```python
import logging

# Development - see everything
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Production - clean logs only
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 2. Log Levels - When to Use What

### DEBUG - Development Details
```python
logger.debug("Received 1024 bytes of audio")
logger.debug("Processing chunk 3 of 10")
logger.debug("Variable x = 42")
```
**Use for:** Step-by-step details, variable values, debugging info

### INFO - Normal Operations
```python
logger.info("WebSocket session started")
logger.info("Transcription completed successfully")
logger.info("User session ended")
```
**Use for:** Start/end of processes, successful operations

### WARNING - Something Unusual
```python
logger.warning("Audio quality below threshold")
logger.warning("API rate limit approaching")
logger.warning("Using fallback model due to timeout")
```
**Use for:** Unexpected but not broken, fallback scenarios

### ERROR - Something Failed
```python
try:
    result = process_audio(data)
except Exception as e:
    logger.error(f"Audio processing failed: {e}")
```
**Use for:** Exceptions, failed operations (app continues)

### CRITICAL - System Breaking
```python
try:
    db = connect_database()
except Exception as e:
    logger.critical(f"Database connection failed: {e}")
    sys.exit(1)
```
**Use for:** System failures that might stop the app

## 3. Separate Loggers for Each Process

### Create different loggers:
```python
# After basicConfig setup
websocket_logger = logging.getLogger("websocket")
transcription_logger = logging.getLogger("transcription")
response_logger = logging.getLogger("response")
extraction_logger = logging.getLogger("extraction")
llm_logger = logging.getLogger("llm")
```

### Use in your code:
```python
# WebSocket operations
websocket_logger.info(f"Client {client_ip} connected")
websocket_logger.error(f"Connection lost for {client_ip}")

# Transcription process
transcription_logger.info(f"Processing audio for session {session_id}")
transcription_logger.debug(f"Audio chunk size: {len(data)} bytes")

# LLM operations
llm_logger.info("Generating response")
llm_logger.warning("LLM response confidence low")
```

## 4. Format String Variables

### Most Useful Format Variables:

```python
# Basic format
format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Detailed format with function and line number
format='%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s'
```

### Complete List of Format Variables:

| Variable | Type | Description | Example |
|----------|------|-------------|----------|
| `%(asctime)s` | string | Timestamp | `2024-01-15 10:30:45,123` |
| `%(name)s` | string | Logger name | `transcription`, `websocket` |
| `%(levelname)s` | string | Log level | `DEBUG`, `INFO`, `ERROR` |
| `%(message)s` | string | Your log message | `Processing started` |
| `%(funcName)s` | string | Function name | `process_audio`, `websocket_endpoint` |
| `%(filename)s` | string | File name | `main.py`, `transcription.py` |
| `%(pathname)s` | string | Full file path | `/app/backend/main.py` |
| `%(lineno)d` | number | Line number | `42`, `156` |
| `%(module)s` | string | Module name | `main`, `transcription` |
| `%(process)d` | number | Process ID | `12345` |
| `%(thread)d` | number | Thread ID | `67890` |
| `%(threadName)s` | string | Thread name | `MainThread`, `AsyncThread` |
| `%(levelno)d` | number | Log level number | `10` (DEBUG), `20` (INFO) |
| `%(created)f` | float | Creation time | `1642248645.123` |
| `%(msecs)d` | number | Milliseconds | `123` |

### Common Format Combinations:

```python
# Simple - good for production
format='%(asctime)s - %(levelname)s - %(message)s'

# Standard - most common
format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Detailed - good for debugging
format='%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s'

# Very detailed - for complex debugging
format='%(asctime)s - %(filename)s:%(lineno)d - %(funcName)s - %(levelname)s - %(message)s'

# Minimal - for testing
format='%(levelname)s - %(funcName)s - %(message)s'
```

### Output Examples:

**Standard format:**
```
2024-01-15 10:30:45,123 - transcription - INFO - Processing audio for session abc123
2024-01-15 10:30:46,456 - websocket - ERROR - Connection lost for 192.168.1.100
```

**Detailed format:**
```
2024-01-15 10:30:45,123 - transcription - process_audio:42 - INFO - Processing audio for session abc123
2024-01-15 10:30:46,456 - websocket - websocket_endpoint:156 - ERROR - Connection lost
```

### Format Variable Types:
- Use `s` for strings: `%(name)s`, `%(message)s`
- Use `d` for numbers: `%(lineno)d`, `%(process)d`
- Use `f` for floats: `%(created)f`

## 5. Real-World Example for Transcription App

```python
# main.py - Setup once
import logging

logging.basicConfig(
    level=logging.INFO,  # Change to DEBUG for development
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create loggers
ws_logger = logging.getLogger("websocket")
transcription_logger = logging.getLogger("transcription")
response_logger = logging.getLogger("response")
extraction_logger = logging.getLogger("extraction")

# Usage in WebSocket handler
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_ip = websocket.client.host
    ws_logger.info(f"Connection from {client_ip}")
    
    try:
        await websocket.accept()
        ws_logger.info(f"WebSocket accepted for {client_ip}")
        
        # Your WebSocket logic here
        
    except Exception as e:
        ws_logger.error(f"WebSocket error for {client_ip}: {e}")
    finally:
        ws_logger.info(f"Connection closed for {client_ip}")

# Usage in transcription processor
class TranscriptionProcessor:
    def __init__(self):
        self.logger = logging.getLogger("transcription")
    
    async def process_audio(self, audio_data, session_id):
        self.logger.info(f"Starting transcription for session {session_id}")
        self.logger.debug(f"Audio data size: {len(audio_data)} bytes")
        
        try:
            result = await self.transcribe(audio_data)
            self.logger.info(f"Transcription completed: {len(result)} chars")
            return result
        except Exception as e:
            self.logger.error(f"Transcription failed for session {session_id}: {e}")
            raise

# Usage in LLM calls
class LLMProcessor:
    def __init__(self):
        self.logger = logging.getLogger("llm")
    
    async def generate_response(self, text):
        self.logger.info("Generating LLM response")
        
        try:
            response = await self.llm.generate(text)
            self.logger.info("LLM response generated successfully")
            return response
        except TimeoutError as e:
            self.logger.warning(f"LLM timeout, using fallback: {e}")
            return self.fallback_response()
        except Exception as e:
            self.logger.error(f"LLM generation failed: {e}")
            raise
```

## 6. Quick Reference

### Environment Setup:
- **Development:** `level=logging.DEBUG` (see everything)
- **Production:** `level=logging.INFO` (clean logs only)

### Common Pattern:
```python
# 1. Setup once in main.py
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# 2. Create logger in each module/class
logger = logging.getLogger("module_name")

# 3. Use throughout your code
logger.info("Process started")
logger.error("Something failed")
```

### Exception Logging:
```python
try:
    risky_operation()
except Exception as e:
    logger.error(f"Operation failed: {e}")
    # Continue with fallback
```

## 7. Logging Utility Functions

### Create centralized logging setup functions:

```python
# log_config.py or utils.py
import logging
import os

def setup_development_log():
    """Setup logging for development - see everything"""
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(funcName)s:%(lineno)d - %(levelname)s - %(message)s',
        force=True
    )
    print("✅ Development logging enabled (DEBUG level)")

def setup_production_log():
    """Setup logging for production - clean logs only"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        force=True
    )
    print("✅ Production logging enabled (INFO level)")

def setup_testing_log():
    """Setup logging for testing - verbose but not overwhelming"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(levelname)s - %(name)s - %(funcName)s - %(message)s',  # Shorter format
        force=True
    )
    print("✅ Testing logging enabled (INFO level, short format)")

def setup_auto_log():
    """Auto-detect environment and setup appropriate logging"""
    env = os.getenv('ENV', 'development')
    
    if env == 'production':
        setup_production_log()
    elif env == 'testing':
        setup_testing_log()
    else:
        setup_development_log()

def setup_file_log(filename="app.log"):
    """Setup logging to file + console"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(filename),
            logging.StreamHandler()
        ],
        force=True
    )
    print(f"✅ File logging enabled: {filename}")
```

### Usage Examples:

**In main.py:**
```python
from backend.utils import setup_production_log
setup_production_log()
```

**In Jupyter notebooks:**
```python
# Cell 1 - Setup logging
from backend.utils import setup_development_log
setup_development_log()

# Cell 2 - Import your modules
from backend.websocket_tasks.transcription_task import TranscriptionProcessor
```

**Environment-based setup:**
```python
# Set environment variable
# export ENV=production  (Linux/Mac)
# set ENV=production     (Windows)

from backend.utils import setup_auto_log
setup_auto_log()  # Automatically chooses based on ENV variable
```

**Quick switching during development:**
```python
from backend.utils import setup_development_log, setup_testing_log

setup_development_log()  # See everything
# ... test some code ...

setup_testing_log()     # Less verbose
# ... test more code ...
```

## 8. OOP vs Function-Based Logging Patterns

### For Classes - Use Instance Loggers (Recommended)

```python
# transcription_processor.py
import logging

class TranscriptionProcessor:
    def __init__(self, session_id=None):
        # Instance logger - better OOP practice
        logger_name = f"transcription.{session_id}" if session_id else "transcription"
        self.logger = logging.getLogger(logger_name)
    
    def process_audio(self, data):
        self.logger.info("Processing audio started")
        self.logger.debug(f"Audio data size: {len(data)} bytes")
        
        try:
            result = self.transcribe(data)
            self.logger.info(f"Transcription completed: {len(result)} chars")
            return result
        except Exception as e:
            self.logger.error(f"Transcription failed: {e}")
            raise

class ResponseProcessor:
    def __init__(self):
        self.logger = logging.getLogger("response")
    
    def generate_response(self, text):
        self.logger.info("Generating response")
        # ... processing logic ...
```

### For Function-Based Modules - Module-Level Logger

```python
# audio_utils.py
import logging

# Declare logger at top of file
logger = logging.getLogger("audio_utils")

def process_audio_file(filename):
    logger.info(f"Processing audio file: {filename}")
    try:
        # ... processing logic ...
        file_size = get_file_size(filename)
        logger.debug(f"File size: {file_size} bytes")
        return result
    except Exception as e:
        logger.error(f"Failed to process {filename}: {e}")
        raise

def convert_format(input_file, output_format):
    logger.info(f"Converting {input_file} to {output_format}")
    try:
        # ... conversion logic ...
        logger.info("Conversion completed successfully")
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        raise
```

```python
# llm_helpers.py
import logging

logger = logging.getLogger("llm_helpers")

def clean_text(text):
    logger.debug(f"Cleaning text: {len(text)} chars")
    # ... cleaning logic ...
    cleaned = text.strip().lower()
    logger.debug(f"Cleaned text: {len(cleaned)} chars")
    return cleaned

def validate_response(response):
    logger.info("Validating LLM response")
    if not response:
        logger.warning("Empty response received")
        return False
    if len(response) < 10:
        logger.warning(f"Response too short: {len(response)} chars")
    return True
```

### Why Use Instance Loggers for Classes?

**Benefits:**
1. **Encapsulation** - Logger belongs to the class instance
2. **Flexibility** - Each instance can have different logger names
3. **Testability** - Easy to mock `self.logger` in unit tests
4. **Clarity** - Clear ownership of logging within the class
5. **Session tracking** - Can include session/user IDs in logger names

### Output Examples:

**Class-based logging:**
```
2024-01-15 10:30:45 - transcription.abc123 - INFO - Processing audio started
2024-01-15 10:30:46 - response - INFO - Generating response
```

**Function-based logging:**
```
2024-01-15 10:30:47 - audio_utils - INFO - Processing audio file: test.wav
2024-01-15 10:30:48 - llm_helpers - INFO - Validating LLM response
```

### Complete Project Structure:

```python
# main.py - Setup logging once
from backend.utils import setup_production_log
setup_production_log()

# Class-based modules
from transcription_processor import TranscriptionProcessor
from response_processor import ResponseProcessor

# Function-based modules
import audio_utils
import llm_helpers

# Usage
processor = TranscriptionProcessor(session_id="abc123")
result = audio_utils.process_audio_file("test.wav")
response = processor.generate_response(result)
```

## 9. Asyncio and Threading Considerations

### Asyncio Tasks (All MainThread)

```python
# All asyncio tasks run on MainThread - cooperative concurrency
async def transcription_task():
    logger.info("Transcription task started")  # MainThread
    await asyncio.sleep(1)  # Yields control
    logger.info("Transcription task completed")  # MainThread

async def response_task():
    logger.info("Response task started")  # MainThread
    await asyncio.sleep(0.5)  # Yields control
    logger.info("Response task completed")  # MainThread

# In Jupyter - use await directly
tasks = [
    asyncio.create_task(transcription_task()),
    asyncio.create_task(response_task())
]
await asyncio.gather(*tasks)
```

### Real Threading (Different Threads)

```python
import threading
import time

def cpu_intensive_task(task_id):
    logger = logging.getLogger("worker")
    logger.info(f"Worker {task_id} started on {threading.current_thread().name}")
    time.sleep(1)  # Blocks this thread only
    logger.info(f"Worker {task_id} completed")

# Create actual threads
threads = []
for i in range(3):
    t = threading.Thread(target=cpu_intensive_task, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()
```

**Key Points:**
- **Python logging is thread-safe** - no extra setup needed
- **Asyncio tasks share MainThread** - cooperative, not parallel
- **Use `%(threadName)s`** in format to see thread information
- **Your WebSocket app uses asyncio** - everything runs on MainThread

## 10. Tips

1. **Call logging setup only once** at app startup or notebook start
2. **Use descriptive logger names** (websocket, transcription, llm)
3. **Use `self.logger` for classes, module logger for functions**
4. **Use utility functions** for consistent logging across environments
5. **Log the start and end of important processes**
6. **Include context in messages** (session_id, user_id, etc.)
7. **Don't log sensitive data** (passwords, tokens, personal info)
8. **Use `force=True`** in utility functions to override existing config
9. **Switch log levels easily** with environment variables or utility functions
10. **Logger names help identify which component is logging**

## 11. Pros and Cons of Logging

### ✅ Pros (Benefits)

**1. Debugging and Troubleshooting**
- Track down bugs faster with detailed error traces
- See exactly where and when problems occur
- Monitor application flow and behavior

**2. Production Monitoring**
- Monitor system health and performance
- Track user behavior and usage patterns
- Get alerts when critical errors occur

**3. Audit Trail**
- Keep records of important operations
- Compliance and security requirements
- Track who did what and when

**4. Performance Analysis**
- Identify bottlenecks and slow operations
- Monitor resource usage over time
- Optimize based on real usage data

**5. Development Productivity**
- Faster debugging during development
- Better understanding of code execution
- Easier collaboration with team members

### ❌ Cons (Drawbacks)

**1. Performance Impact**
```python
# Logging has overhead - especially with DEBUG level
logger.debug(f"Processing {len(data)} items: {expensive_calculation()}")  # Slow!

# Better approach
if logger.isEnabledFor(logging.DEBUG):
    logger.debug(f"Processing {len(data)} items: {expensive_calculation()}")
```

**2. Storage and Disk Space**
- Log files can grow very large quickly
- Need log rotation and cleanup strategies
- Storage costs in cloud environments

**3. Information Overload**
- Too much logging makes it hard to find important information
- DEBUG level can create noise in production
- Need to balance detail vs. readability

**4. Security Risks**
```python
# ❌ DON'T log sensitive data
logger.info(f"User login: {username} with password {password}")  # NEVER!
logger.info(f"API key: {api_key}")  # NEVER!

# ✅ DO log safely
logger.info(f"User login: {username}")
logger.info("API authentication successful")
```

**5. Maintenance Overhead**
- Need to manage log levels across environments
- Log rotation and archival strategies
- Monitoring and alerting setup

### 🎯 Best Practices to Minimize Cons

**1. Smart Log Levels**
```python
# Production: INFO and above only
setup_production_log()  # INFO, WARNING, ERROR, CRITICAL

# Development: Everything
setup_development_log()  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

**2. Avoid Expensive Operations in Logs**
```python
# ❌ Bad - always calculates even if DEBUG is off
logger.debug(f"Data analysis: {expensive_analysis(data)}")

# ✅ Good - only calculates if DEBUG is enabled
if logger.isEnabledFor(logging.DEBUG):
    logger.debug(f"Data analysis: {expensive_analysis(data)}")
```

**3. Log Rotation**
```python
from logging.handlers import RotatingFileHandler

# Rotate logs when they get too big
handler = RotatingFileHandler(
    'app.log', 
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5  # Keep 5 old files
)
```

**4. Structured Logging for Production**
```python
import json

# Instead of string formatting
logger.info(f"User {user_id} completed action {action}")

# Use structured data
logger.info("User action completed", extra={
    'user_id': user_id,
    'action': action,
    'duration_ms': duration
})
```

**5. Never Log Sensitive Data**
```python
# ❌ NEVER log these
- Passwords, API keys, tokens
- Credit card numbers, SSNs
- Personal information (emails, addresses)
- Internal system details in production

# ✅ DO log these
- User IDs (not usernames)
- Action types and results
- Performance metrics
- Error messages (sanitized)
```

### 📊 When to Use Different Log Levels

| Level | Development | Testing | Production | Use Case |
|-------|-------------|---------|------------|-----------|
| DEBUG | ✅ Always | ❌ Never | ❌ Never | Variable values, step-by-step flow |
| INFO | ✅ Always | ✅ Yes | ✅ Yes | Normal operations, start/end events |
| WARNING | ✅ Always | ✅ Yes | ✅ Yes | Unusual but not critical situations |
| ERROR | ✅ Always | ✅ Yes | ✅ Yes | Failures that don't stop the app |
| CRITICAL | ✅ Always | ✅ Yes | ✅ Yes | System-breaking failures |

### 🚀 Summary

**Logging is essential for:**
- Debugging and troubleshooting
- Production monitoring
- Understanding system behavior

**But be careful about:**
- Performance impact (especially DEBUG level)
- Storage costs and log file sizes
- Security (never log sensitive data)
- Information overload

**The key is finding the right balance** between useful information and system performance!

## 12. Inspecting LogRecord Attributes

### How to See All Available Attributes

When creating custom formatters, you might want to know what attributes are available in the LogRecord object:

```python
class DebugFormatter(logging.Formatter):
    """Formatter to inspect all LogRecord attributes"""
    def format(self, record):
        print("\n=== LogRecord Attributes ===")
        for attr in sorted(dir(record)):
            if not attr.startswith('_'):
                try:
                    value = getattr(record, attr)
                    if not callable(value):
                        print(f"{attr:15}: {value}")
                except:
                    pass
        print("=" * 30)
        return super().format(record)

# Test it
handler = logging.StreamHandler()
handler.setFormatter(DebugFormatter())
logger = logging.getLogger("test")
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

logger.info("Test message to see all attributes")
```

### Complete LogRecord Attributes Reference

| Attribute | Type | Description | Example |
|-----------|------|-------------|----------|
| **Time Related** |
| `created` | float | Creation time (timestamp) | `1642248645.123` |
| `msecs` | float | Millisecond portion | `123.456` |
| `relativeCreated` | float | Time relative to module load | `1234.567` |
| **Level Information** |
| `levelname` | str | Level name | `INFO`, `DEBUG`, `ERROR` |
| `levelno` | int | Level number | `20` (INFO), `10` (DEBUG) |
| **Location Information** |
| `name` | str | Logger name | `transcription`, `websocket` |
| `module` | str | Module name | `main`, `utils` |
| `filename` | str | File name | `main.py`, `processor.py` |
| `pathname` | str | Full file path | `/app/backend/main.py` |
| `funcName` | str | Function name | `process_audio`, `setup_log` |
| `lineno` | int | Line number | `42`, `156` |
| **Process/Thread Information** |
| `process` | int | Process ID | `12345` |
| `processName` | str | Process name | `MainProcess` |
| `thread` | int | Thread ID | `67890` |
| `threadName` | str | Thread name | `MainThread` |
| **Message Information** |
| `msg` | str | Original message format | `"Processing %s"` |
| `args` | tuple | Format arguments | `('audio.wav',)` |
| `message` | str | Formatted message | `"Processing audio.wav"` |
| **Exception Information** |
| `exc_info` | tuple/None | Exception info | `(type, value, traceback)` |
| `exc_text` | str/None | Exception text | Formatted exception |
| `stack_info` | str/None | Stack trace | Stack information |

### Custom Formatter Using All Attributes

```python
class ComprehensiveFormatter(logging.Formatter):
    """Formatter using multiple LogRecord attributes"""
    def format(self, record):
        log_data = {
            # Time
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'relative_time': f"{record.relativeCreated:.3f}ms",
            
            # Level
            'level': record.levelname,
            'level_num': record.levelno,
            
            # Location
            'logger': record.name,
            'module': record.module,
            'file': record.filename,
            'function': record.funcName,
            'line': record.lineno,
            
            # Process/Thread
            'process_id': record.process,
            'process_name': record.processName,
            'thread_id': record.thread,
            'thread_name': record.threadName,
            
            # Message
            'message': record.getMessage(),
            'raw_msg': record.msg,
            'args': record.args,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
            
        # Add extra data if provided
        if hasattr(record, 'extra_data'):
            log_data.update(getattr(record, 'extra_data', {}))
            
        return json.dumps(log_data, default=str)
```

### Quick Attribute Inspector Function

```python
def inspect_log_record():
    """Quick function to see what's in a LogRecord"""
    import logging
    
    class InspectorFormatter(logging.Formatter):
        def format(self, record):
            attrs = {}
            for attr in dir(record):
                if not attr.startswith('_') and not callable(getattr(record, attr)):
                    try:
                        attrs[attr] = getattr(record, attr)
                    except:
                        pass
            
            print("Available LogRecord attributes:")
            for key, value in sorted(attrs.items()):
                print(f"  {key:20}: {type(value).__name__:10} = {value}")
            return ""
    
    # Test logger
    logger = logging.getLogger("inspector")
    handler = logging.StreamHandler()
    handler.setFormatter(InspectorFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    
    logger.info("Inspecting LogRecord attributes")

# Run this to see all attributes
inspect_log_record()
```

### Practical Usage Tips

**1. For Development - Include Location Info:**
```python
format='%(asctime)s - %(name)s - %(filename)s:%(lineno)d - %(funcName)s - %(levelname)s - %(message)s'
```

**2. For Production - Minimal but Useful:**
```python
format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
```

**3. For Debugging - Everything:**
```python
format='%(asctime)s - %(processName)s[%(process)d] - %(threadName)s[%(thread)d] - %(name)s - %(filename)s:%(lineno)d - %(funcName)s - %(levelname)s - %(message)s'
```

**4. For JSON Logging - Structured Data:**
```python
# Use the JSONFormatter from utils.py with selected attributes
log_data = {
    'timestamp': datetime.fromtimestamp(record.created).isoformat(),
    'level': record.levelname,
    'logger': record.name,
    'function': record.funcName,
    'line': record.lineno,
    'message': record.getMessage()
}
```

This gives you complete control over what information appears in your logs!

This setup will help you track what's happening in your real-time transcription system and make debugging much easier!