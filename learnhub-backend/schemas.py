from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class LanguageRequest(BaseModel):
    text: str = Field(..., description="The word or sentence to look up", min_length=1, max_length=1000)
    input_type: str = Field(..., description="Type: 'word' or 'sentence'", pattern="^(word|sentence)$")

class LLMResponse(BaseModel):
    explanation: str
    examples: List[str]
    usage_contexts: List[str]

class SaveWordRequest(BaseModel):
    text: str = Field(..., description="The original word or sentence")
    input_type: str = Field(..., description="Type: 'word' or 'sentence'", pattern="^(word|sentence)$")
    explanation: str = Field(..., description="LLM generated explanation")
    examples: List[str] = Field(..., description="LLM generated examples")
    usage_contexts: List[str] = Field(..., description="LLM generated usage contexts")
    tag: str = Field("general", description="Source tag (e.g., domain name)")

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class User(UserBase):
    id: int
    disabled: Optional[bool] = None
    class Config:
        from_attributes = True

class UserInDBBase(UserBase):
    id: int
    disabled: Optional[bool] = None
    hashed_password: str
    class Config:
        from_attributes = True

class UserInDB(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserQueryCreate(BaseModel):
    user_id: Optional[int] = None
    text: str
    input_type: str
    tag: str = "general"

class UserQuery(UserQueryCreate):
    id: int
    created_at: Optional[datetime] = None
    explanation: Optional[str] = None
    examples: Optional[List[str]] = None
    usage_contexts: Optional[List[str]] = None
    class Config:
        from_attributes = True

class LLMResponseCreate(BaseModel):
    query_id: int
    explanation: str
    examples: List[str]
    usage_contexts: List[str]

class LLMResponseDB(LLMResponseCreate):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
