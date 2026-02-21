from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db import models, session
from app.schemas import forum as schemas
from app.core import security, config
from app.db.session import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=config.settings.PROJECT_NAME,
    version=config.settings.VERSION,
    description="Backend for a forum application with posts, comments, likes, and moderation."
)


# Authentication Endpoints

@app.post("/register", response_model=schemas.User, tags=["Authentication"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/token", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(
        form_data: schemas.UserCreate,
        db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# Post Endpoints

@app.get("/posts", response_model=List[schemas.Post], tags=["Posts"])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.Post).offset(skip).limit(limit).all()

    results = []
    for post in posts:
        likes_count = db.query(models.Like).filter(models.Like.post_id == post.id).count()
        post_data = schemas.Post.model_validate(post)
        post_data.likes_count = likes_count
        results.append(post_data)

    return results


@app.get("/posts/{post_id}", response_model=schemas.Post, tags=["Posts"])
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    likes_count = db.query(models.Like).filter(models.Like.post_id == post.id).count()
    post_data = schemas.Post.model_validate(post)
    post_data.likes_count = likes_count
    return post_data


@app.post("/posts", response_model=schemas.Post, tags=["Posts"])
def create_post(
        post: schemas.PostCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_active_user)
):
    db_post = models.Post(**post.model_dump(), author_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


# Comment Endpoints

@app.post("/posts/{post_id}/comments", response_model=schemas.Comment, tags=["Comments"])
def create_comment(
        post_id: int,
        comment: schemas.CommentCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_active_user)
):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_comment = models.Comment(**comment.model_dump(), post_id=post_id, author_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


# Like Endpoints

@app.post("/posts/{post_id}/like", tags=["Likes"])
def like_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_active_user)
):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    if db_post.author_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot like your own post")

    existing_like = db.query(models.Like).filter(
        models.Like.post_id == post_id,
        models.Like.user_id == current_user.id
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="You have already liked this post")

    db_like = models.Like(post_id=post_id, user_id=current_user.id)
    db.add(db_like)
    db.commit()
    return {"message": "Post liked successfully"}


# Moderation Endpoints

@app.post("/posts/{post_id}/moderate", tags=["Moderation"])
def moderate_post(
        post_id: int,
        is_misleading: bool = True,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(security.get_current_moderator)
):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_post.is_misleading = is_misleading
    db.commit()
    return {"message": f"Post marked as {'misleading' if is_misleading else 'accurate'}"}