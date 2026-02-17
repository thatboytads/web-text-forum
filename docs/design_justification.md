# Forum Backend Design and Justification

## 1. Web Framework: FastAPI
**Choice:** [FastAPI](https://fastapi.tiangolo.com/)
**Justification:**
- **Performance:** FastAPI is one of the fastest Python frameworks available, built on top of Starlette and Pydantic.
- **Automatic Documentation:** It automatically generates OpenAPI (Swagger) and Redoc documentation. This directly supports the requirement for a "simple API" that can be easily documented and shared (e.g., via Postman).
- **Type Safety:** Using Python type hints for data validation (via Pydantic) reduces bugs and improves developer experience.
- **Asynchronous Support:** Built-in support for `async/await`, allowing for efficient handling of concurrent requests.

## 2. Datastore: SQLite with SQLAlchemy ORM
**Choice:** [SQLAlchemy](https://www.sqlalchemy.org/) with SQLite
**Justification:**
- **SQLAlchemy Integration:** It has excellent "out-of-the-box" integration with FastAPI. It is the most mature and widely used ORM in the Python ecosystem.
- **Efficiency:** Using an ORM allows for clean, Pythonic database interactions while maintaining the ability to write optimized raw SQL if necessary. We will use relationship loading strategies (like `joinedload`) to ensure efficient data retrieval and avoid N+1 query problems.
- **Portability:** SQLite is a file-based database that requires no separate server process, making it ideal for this environment while remaining fully SQL-compliant. The code can be easily migrated to PostgreSQL or MySQL by simply changing the connection string.

## 3. Authentication: JWT with Internal Password Hashing
**Choice:** [JWT (JSON Web Tokens)](https://jwt.io/) with `passlib` (bcrypt)
**Justification:**
- **Statelessness:** JWTs allow the backend to be stateless, which is standard for modern APIs and scales well.
- **Security:** Passwords will be hashed using the `bcrypt` algorithm via the `passlib` library, ensuring industry-standard security for stored credentials.
- **Self-Contained:** This fulfills the requirement to handle authentication within the application without relying on external providers like Auth0 or Firebase.

## 4. API Documentation: Postman Collection
**Approach:**
- Since FastAPI automatically generates an OpenAPI schema at `/openapi.json`, we can directly export this schema and import it into Postman. I will also provide a pre-configured Postman Collection JSON file for immediate use.
