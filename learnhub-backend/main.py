from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import signal
import uvicorn
from dotenv import load_dotenv
from typing import List, Optional # List import edildi

from database import get_db_connection
from mysql.connector import Error as MySQLError
import crud
import auth
import services
from schemas import (
    User, Token, UserCreate, LanguageRequest, LLMResponse, SaveWordRequest, UserQuery
)

load_dotenv()

app = FastAPI(
    title=os.getenv("API_TITLE", "LearnHub API"),
    description="API for language learning explanations using Groq LLM and user authentication.",
    version="0.4.0" 
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=User, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
async def register(user_data: UserCreate):
    try:
        return auth.register_new_user(user_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error in /register endpoint: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred during registration.")

@app.post("/token", response_model=Token, tags=["Authentication"])
async def login_for_access_token(
    username: str = Form("kcanmersin", description="Default username for quick login"),
    password: str = Form("19071907", description="Default password for quick login")
):
    user = auth.authenticate_user(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.disabled:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account.",
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User, tags=["Users"])
async def read_users_me(current_user: User = Depends(auth.get_current_active_user)):
    return current_user

@app.post("/explanation", response_model=LLMResponse, tags=["Learning"])
async def get_word_explanation(request: LanguageRequest):
    return await services.get_explanation(request)

@app.post("/save", response_model=UserQuery, tags=["Learning"])
async def save_word_explanation(
    request: SaveWordRequest,
    current_user: User = Depends(auth.get_current_active_user)
):
    return await services.save_explanation(request, current_user)

@app.get("/queries", response_model=List[UserQuery], tags=["Learning"])
async def get_saved_queries(
    current_user: User = Depends(auth.get_current_active_user)
):
    queries = crud.get_queries_by_user_id(current_user.id)
    return queries
@app.post(
    "/setup/create-default-user",
    response_model=User,
    tags=["Setup"],
    summary="Create Default User",
    status_code=status.HTTP_201_CREATED
)
async def create_default_user_endpoint():
    default_username = "kcanmersin@gmail.com"
    default_password = "1907"
    default_email = "kcanmersin@gmail.com"
    print(f"Attempting to create default user: {default_username} via API endpoint...")
    try:
        existing_user = crud.get_user(default_username)
        if existing_user:
            print(f"Default user '{default_username}' already exists. Creation aborted.")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Default user '{default_username}' already exists."
            )
    except Exception as e:
         print(f"Error checking for existing default user: {e}")
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail="Error checking for default user existence."
         )
    try:
        print(f"Default user '{default_username}' not found. Proceeding with creation...")
        default_user_data = UserCreate(
            username=default_username,
            email=default_email,
            password=default_password
        )
        hashed_password = auth.get_password_hash(default_user_data.password)
        created_user_in_db = crud.create_user(default_user_data, hashed_password)
        if created_user_in_db:
            print(f"Default user '{default_username}' created successfully via API.")
            return User.model_validate(created_user_in_db)
        else:
             print(f"Error: crud.create_user returned None for default user.")
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create default user after check (CRUD returned None)."
            )
    except MySQLError as db_error:
         print(f"Database error during default user creation via API: {db_error}")
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail=f"Database error during default user creation: {db_error.msg}"
         )
    except Exception as e:
         print(f"Unexpected error during default user creation via API: {e}")
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail="An unexpected error occurred while creating the default user."
         )

@app.on_event("startup")
async def startup_event():
    print("Application startup: Checking/Creating database tables...")
    try:
        crud.create_user_table()
        crud.create_app_tables()
        print("Database tables checked/created.")
    except Exception as e:
        print(f"FATAL: Error during database table creation at startup: {e}")
    print("Application startup completed.")

@app.on_event("shutdown")
async def shutdown_event():
    print("Application shutting down...")
    print("Application shutdown completed.")

def signal_handler(signum, frame):
    print(f"\nReceived signal {signum}. Initiating graceful shutdown...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    reload = os.getenv("RELOAD", "true").lower() == "true"

    print(f"Starting Uvicorn server on {host}:{port} (Reload: {reload})")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
    print("Server stopped.")
