# AI Sales Coaching System

Real-time sales coaching system that combines transcription with intelligent decision-making to guide sales agents through structured conversation stages.

## Architecture Overview

### Main Sales Flow (Linear Progression)
```
greeting → discovery → pitch → closing → follow_up (optional)
```

### Objection Handling (Interrupt Pattern)
- **Objection handling** can trigger from any main stage
- After resolution: either resume original stage or advance to next stage
- Decision based on signals strength and resolution success

## Implementation Plan

### Phase 1: Stage Classification
- Create stage classifier with evidence/signals
- Input: stage definitions + transcription
- Output: current stage + supporting signals
- Handle objection detection as parallel process

### Phase 2: Action Suggestion Engine
- **POC**: Rule-based using Thai regex patterns
- **Next Phase**: LLM-based for more sophisticated suggestions
- Output: [action:suggested_lines]

## Real-time Processing
- **Time Window**: 8-10 seconds transcription
- **Rolling Offset**: Every 2-4 seconds
- **Thai Processing**: Tokenization for content words only
- **Context**: Rolling window of last 2-3 segments

## Stage Definitions
Each stage contains:
- **goal**: What to achieve
- **do**: Best practices
- **avoid**: Behaviors to prevent
- **collects**: Required information
- **objection_patterns**: Common Thai objection phrases

## Thai Language Support
- Regex patterns for common objections
- Word tokenization using pythainlp
- Semantic similarity as future enhancement

## Extraction Agent Pattern

Core approach: **system_prompt + structured_output** for all classification and extraction tasks.

### Generic Extraction Function
```python
def extract_with_llm(
    transcription: str,
    system_prompt: str, 
    output_model: BaseModel
) -> BaseModel
```

### Features Using Extraction Pattern

**Stage Classifier** (Primary)
- Input: transcription + stage definitions from YAML
- System Prompt: "Analyze conversation and classify stage based on these definitions..."
- Output: `SuggestedSalesStage` (stage + signals + actions)

**Objection Detector** (Reuse)
- Input: transcription + objection patterns
- System Prompt: "Detect Thai objections using these patterns..."
- Output: `ObjectionPattern` match with confidence

**Signal Extractor** (Reuse)
- Input: transcription + stage context
- System Prompt: "Extract conversation signals that indicate stage progression..."
- Output: List of evidence/signals

**Action Generator** (Reuse)
- Input: transcription + current stage + customer context
- System Prompt: "Generate appropriate actions and Thai responses for this stage..."
- Output: List of `Action` with suggested lines

## Features to Implement

### Core Engine
- [ ] **Stage Classifier**: Analyze transcription and classify current conversation stage
- [ ] **Objection Detector**: Parallel process to detect Thai objection patterns
- [ ] **Action Suggestion Engine**: Generate contextual actions and suggested responses
- [ ] **State Manager**: Track conversation state and handle stage transitions

### Real-time Processing
- [ ] **Transcription Window Handler**: Process 8-10s windows with 2-4s rolling offset
- [ ] **Thai Text Processor**: Tokenize and extract content words using pythainlp
- [ ] **Context Manager**: Maintain rolling context of last 2-3 segments

### Stage Management
- [ ] **Main Flow Controller**: Handle linear progression (greeting → discovery → pitch → closing → follow_up)
- [ ] **Objection Interrupt Handler**: Detect objections, handle resolution, decide resume vs advance
- [ ] **Transition Logic**: Validate required signals and collections before stage advancement

### Thai Language Features
- [ ] **Regex Pattern Matcher**: Match Thai objection patterns with confidence scoring
- [ ] **Response Generator**: Provide Thai suggested responses based on objection type
- [ ] **Signal Extractor**: Extract Thai conversation signals for stage classification

### Data Models
- [x] **ConversationState**: Track current/previous stages and objection status
- [x] **ObjectionPattern**: Thai regex patterns with confidence thresholds
- [x] **StageTransition**: Rules for stage progression
- [x] **SuggestedSalesStage**: Output format with actions and signals
