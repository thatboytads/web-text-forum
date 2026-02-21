import requests
import time
import subprocess
import os

# Configuration
BASE_URL = "http://127.0.0.1:8000"


def test_backend():
    # Start server in background from the root directory
    # Set PYTHONPATH to include the current directory so 'app' is found
    env = os.environ.copy()
    env["PYTHONPATH"] = os.getcwd()

    # Remove existing db if any to start fresh
    if os.path.exists("forum.db"):
        os.remove("forum.db")

    server_process = subprocess.Popen(
        ["uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        env=env
    )
    time.sleep(3)  # Wait for server to start

    try:
        print("--- Testing Registration ---")
        user1_data = {"username": "user1", "password": "password123", "role": "regular"}
        resp = requests.post(f"{BASE_URL}/register", json=user1_data)
        print(f"Register User 1: {resp.status_code}")
        assert resp.status_code == 200

        user2_data = {"username": "user2", "password": "password123", "role": "regular"}
        resp = requests.post(f"{BASE_URL}/register", json=user2_data)
        print(f"Register User 2: {resp.status_code}")
        assert resp.status_code == 200

        mod_data = {"username": "moderator", "password": "modpassword", "role": "moderator"}
        resp = requests.post(f"{BASE_URL}/register", json=mod_data)
        print(f"Register Moderator: {resp.status_code}")
        assert resp.status_code == 200

        print("\n--- Testing Login ---")
        resp = requests.post(f"{BASE_URL}/token", json=user1_data)
        print(f"Login User 1: {resp.status_code}")
        token1 = resp.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}

        resp = requests.post(f"{BASE_URL}/token", json=user2_data)
        token2 = resp.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        resp = requests.post(f"{BASE_URL}/token", json=mod_data)
        token_mod = resp.json()["access_token"]
        headers_mod = {"Authorization": f"Bearer {token_mod}"}

        print("\n--- Testing Post Creation ---")
        post_data = {"title": "First Post", "content": "This is the content of the first post."}
        resp = requests.post(f"{BASE_URL}/posts", json=post_data, headers=headers1)
        print(f"Create Post: {resp.status_code}")
        post_id = resp.json()["id"]

        print("\n--- Testing Anonymous Viewing ---")
        resp = requests.get(f"{BASE_URL}/posts")
        print(f"Get Posts (Anonymous): {resp.status_code}, Count: {len(resp.json())}")
        assert resp.status_code == 200

        print("\n--- Testing Likes ---")
        resp = requests.post(f"{BASE_URL}/posts/{post_id}/like", headers=headers2)
        print(f"User 2 likes Post: {resp.status_code}")
        assert resp.status_code == 200

        resp = requests.post(f"{BASE_URL}/posts/{post_id}/like", headers=headers1)
        print(f"User 1 likes own Post (should fail): {resp.status_code}")
        assert resp.status_code == 400

        print("\n--- Testing Comments ---")
        comment_data = {"content": "This is a comment."}
        resp = requests.post(f"{BASE_URL}/posts/{post_id}/comments", json=comment_data, headers=headers2)
        print(f"Create Comment: {resp.status_code}")
        assert resp.status_code == 200

        print("\n--- Testing Moderation ---")
        resp = requests.post(f"{BASE_URL}/posts/{post_id}/moderate", params={"is_misleading": True},
                             headers=headers_mod)
        print(f"Moderator marks as misleading: {resp.status_code}")
        assert resp.status_code == 200

        print("\n--- ALL TESTS PASSED ---")

    finally:
        server_process.terminate()
        server_process.wait()


if __name__ == "__main__":
    test_backend()