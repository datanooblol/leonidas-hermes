# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     """WebSocket endpoint for real-time audio streaming"""
#     await websocket.accept()
#     print("WebSocket connection established")
    
#     try:
#         while True:
#             # Receive audio data
#             data = await websocket.receive_bytes()
            
#             # Process audio in real-time
#             timestamp = str(int(time.time() * 1000))
            
#             # Save and process audio
#             out_dir = Path("./out_ws")
#             out_dir.mkdir(exist_ok=True, parents=True)
            
#             try:
#                 # Convert audio to WAV
#                 audio_segment = AudioSegment.from_file(io.BytesIO(data))
#                 wav_file = out_dir / f"{timestamp}.wav"
#                 audio_segment.export(wav_file, format="wav")
#                 global ws_session_id
#                 if ws_session_id is None:
#                     ws_session_id = voice_memory.create_session()
#                     print(f"Created WebSocket session: {ws_session_id}")
#                 # Mock transcription
#                 # transcription = f"Real-time transcription at {timestamp}"
#                 chunk_id = voice_memory.create_chunk(ws_session_id, str(wav_file), 0)
#                 records = voice_memory.get_last_n_chunks(ws_session_id, 2)
#                 transcription = ol2t.run(records)
#                 transcription_id = voice_memory.create_transcription(chunk_id, transcription)
#                 # get by session or chunks better?
#                 last_transcriptions = voice_memory.get_transcriptions_by_chunks([rec.chunk_id for rec in records])
#                 latest, previous = last_transcriptions[0].transcribed_text, last_transcriptions[1].transcribed_text
#                 deduplicated_transcription = deduplicate_exact_match(latest, previous)
#                 # Send result back
#                 await websocket.send_text(json.dumps({
#                     "timestamp": timestamp,
#                     "transcription": deduplicated_transcription,
#                     "status": "success"
#                 }))
                
#                 print(f"Processed WebSocket audio: {len(data)} bytes")
                
#             except Exception as e:
#                 await websocket.send_text(json.dumps({
#                     "error": str(e),
#                     "status": "error"
#                 }))
                
#     except WebSocketDisconnect:
#         print("WebSocket connection closed")