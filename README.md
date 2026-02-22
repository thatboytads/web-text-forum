# TruthForum

A full-stack forum app with JWT auth, posts, comments, likes, and moderator flagging for misleading content.

## Project layout

- `app/` - FastAPI backend
- `frontend/` - Angular frontend
- `forum.db` - SQLite database (created on first run)

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm

## Setup

### 1) Backend

```bash
cd /home/tadiwamuzondo/Personal/web-text-forum
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Frontend

```bash
cd /home/tadiwamuzondo/Personal/web-text-forum/frontend
npm install
```

## Run

### Start the backend

```bash
cd /home/tadiwamuzondo/Personal/web-text-forum
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend

```bash
cd /home/tadiwamuzondo/Personal/web-text-forum/frontend
npm start
```

- Frontend: http://localhost:4200
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

## Test users (optional)

If you want sample users, run:

```bash
cd /home/tadiwamuzondo/Personal/web-text-forum
./create_test_users.sh
```

This creates:
- Regular user: `user1` / `password123`
- Moderator: `mod1` / `password123`

You can also seed sample posts/comments:

```bash
cd /home/tadiwamuzondo/Personal/web-text-forum
./seed_data.sh
```

## Feature notes

- Moderators can mark posts as “misleading or false information.” Flagged posts show a red outline and warning label for all users.
- Regular users can like posts (one like per user) and add comments.

## Useful scripts

- `start.sh` - Starts backend + frontend (requires dependencies installed)
- `create_test_users.sh` - Creates sample users
- `curl -s http://localhost:8000/posts | cat` - Adds sample posts/comments

## Troubleshooting

- If the frontend cannot reach the backend, confirm the backend is running on port 8000.
- If you changed the frontend port, update CORS in `app/main.py`.
