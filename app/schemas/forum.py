from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    REGULAR = "regular"
    MODERATOR = "moderator"

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.REGULAR

class User(UserBase):
    id: int
    role: UserRole
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    post_id: int
    author_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    author_id: int
    is_misleading: bool
    created_at: datetime
    comments: List[Comment] = []
    likes_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)
