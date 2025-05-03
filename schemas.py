# schemas.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List

class LanguageRequest(BaseModel):
    text: str = Field(..., description="The word or sentence to learn", min_length=1, max_length=1000)
    input_type: str = Field(..., description="Type: 'word' or 'sentence'", pattern="^(word|sentence)$")

class LLMResponse(BaseModel):
    explanation: str
    examples: List[str]
    usage_contexts: List[str]

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

class UserQuery(UserQueryCreate):
    id: int
    created_at: Optional[str] = None
    class Config:
        from_attributes = True

class LLMResponseCreate(BaseModel):
    query_id: int
    explanation: str
    examples: List[str]
    usage_contexts: List[str]

class LLMResponseDB(LLMResponseCreate):
    id: int
    created_at: Optional[str] = None
    class Config:
        from_attributes = True