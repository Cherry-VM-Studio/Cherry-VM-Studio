import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from h11 import Request
from pydantic import ValidationError
from contextlib import asynccontextmanager
from modules.postgresql.main import open_async_pool, close_async_pool

from .endpoints.authentication import authentication
from .endpoints.machine_resources.iso_files import main as iso_files
from .endpoints.machine_resources.machine_templates import main as machine_templates
from .endpoints.machines import machines, network, websockets
from .endpoints.users import users, groups, roles

@asynccontextmanager
async def lifespan(app: FastAPI):
    await open_async_pool()
    yield
    await close_async_pool()

app = FastAPI(root_path="/api", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow local origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(authentication.router)
app.include_router(iso_files.router)
app.include_router(machine_templates.router)
app.include_router(machines.router)
app.include_router(machines.debug_router)
app.include_router(websockets.router)
app.include_router(network.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(roles.router)

@app.exception_handler(Exception)
async def internal_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}") 
    
    # Return a JSON response with a 500 status code and **correct headers**.
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )
    
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    errors = exc.errors()
    for error in errors:
        if error.get("type") == "uuid_parsing":
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid UUID format."},
                headers={"Access-Control-Allow-Origin": "*"},
            )
            
    logging.error(f"Unhandled exception: {exc}") 
            
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid type or form of the passed content."},
        headers={"Access-Control-Allow-Origin": "*"},
    )
