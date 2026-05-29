from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import attendees, speakers, stats, export

app = FastAPI(title="CSR Summit CRM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(attendees.router)
app.include_router(speakers.router)
app.include_router(stats.router)
app.include_router(export.router)