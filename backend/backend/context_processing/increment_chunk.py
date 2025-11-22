# def analyze_chunk(new_text, conversation_context):
#     # Combine new chunk with recent context
#     full_text = f"{conversation_context} {new_text}"
    
#     # Intent classification (even with short text)
#     intent = classify_intent(full_text)
    
#     # Sentiment analysis
#     sentiment = analyze_sentiment(new_text)
    
#     # Key phrase extraction
#     keywords = extract_keywords(full_text)
    
#     return {
#         "intent": intent,
#         "sentiment": sentiment, 
#         "keywords": keywords,
#         "urgency": detect_urgency(new_text)
#     }
