from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from agents.llms.bedrock import BedrockNova
from agents.llms.base import ModelResponse, ModelRequest
from agents.routers.sales_coach.router import router as sales_coach_router

app = FastAPI(title="Agent Service")

for r in [
    sales_coach_router,
]:
    app.include_router(r)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.post("/one-short-agent", response_model=ModelResponse)
# async def agent_greeting(request:ModelRequest):
#     llm = BedrockNova()
#     response = llm.run(system_prompt="You are the best bro in the world. Answer it in short and laid-back manner.", messages=[dict(role="user", content=request.content)])
#     return response

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Agent API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)