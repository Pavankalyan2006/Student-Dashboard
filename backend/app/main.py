"""
B.Tech AI Learning Platform - FastAPI Application Reference Architecture
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid

app = FastAPI(
    title="B.Tech AI Learning Platform API",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Schemas -----------------
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

class StudentBase(BaseModel):
    id: str
    name: str
    email: EmailStr
    branch: str
    semester: int
    role: str
    is_active: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    student: StudentBase

# ----------------- Routes -----------------
@app.get("/api/v1/health", response_model=HealthResponse)
def get_health():
    return {
        "status": "ok",
        "service": "btech-ai-learning-platform",
        "version": "1.0.0",
    }

@app.get("/api/v1/health/db")
def get_db_health():
    return {
        "status": "ok",
        "database": "connected",
    }

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    if request.email == "student@btech.edu" and request.password == "Password123!":
        return {
            "access_token": "mock-jwt-token-fastapi",
            "token_type": "bearer",
            "student": {
                "id": "std_01j8k9x2p4",
                "name": "Pavan Kalyan V.",
                "email": request.email,
                "branch": "Computer Science & Engineering",
                "semester": 6,
                "role": "STUDENT",
                "is_active": True,
            },
        }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
