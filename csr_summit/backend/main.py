from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import attendees, speakers, stats, export

app = FastAPI(title="CSR Summit CRM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://csrsummit2.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(attendees.router)
app.include_router(speakers.router)
app.include_router(stats.router)
app.include_router(export.router)


if __name__ == "__main__":
    import uvicorn, os
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT",8000)), reload=False)
