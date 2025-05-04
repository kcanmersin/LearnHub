from mysql.connector import Error, MySQLConnection
from typing import Optional, List, Dict, Any
import json

from schemas import UserInDB, UserCreate, UserQueryCreate, LLMResponseCreate, UserQuery, LLMResponseDB
from database import get_db_connection

def get_user(username: str) -> Optional[UserInDB]:
    conn = get_db_connection()
    if not conn:
        print("Database connection failed in get_user")
        return None
    user_data = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, full_name, hashed_password, disabled FROM users WHERE username = %s", (username,))
        user_data = cursor.fetchone()
        if user_data:
            return UserInDB(**user_data)
    except Error as e:
        print(f"Error getting user '{username}': {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
    return None

def create_user(user_data: UserCreate, hashed_password: str) -> Optional[UserInDB]:
    conn = get_db_connection()
    if not conn:
        print("Database connection failed in create_user")
        return None
    created_user = None
    try:
        cursor = conn.cursor()
        sql = """INSERT INTO users (username, email, full_name, hashed_password)
                 VALUES (%s, %s, %s, %s)"""
        values = (user_data.username, user_data.email, user_data.full_name, hashed_password)
        cursor.execute(sql, values)
        conn.commit()
        created_user = get_user(user_data.username)
    except Error as e:
        print(f"Error creating user '{user_data.username}': {e}")
        conn.rollback()
        raise e
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
    return created_user

def save_user_query(query_data: UserQueryCreate) -> Optional[int]:
    conn = get_db_connection()
    if not conn:
        print("Database connection failed in save_user_query")
        return None
    query_id = None
    try:
        cursor = conn.cursor()
        sql = "INSERT INTO user_queries (user_id, text, input_type, tag) VALUES (%s, %s, %s, %s)"
        values = (query_data.user_id, query_data.text, query_data.input_type, query_data.tag)
        cursor.execute(sql, values)
        conn.commit()
        query_id = cursor.lastrowid
        print(f"Saved query with ID: {query_id}, User ID: {query_data.user_id}, Tag: {query_data.tag}")
    except Error as e:
        print(f"Database error saving user query: {e}")
        conn.rollback()
        raise e
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
    return query_id

def get_user_query(query_id: int) -> Optional[UserQuery]:
    conn = get_db_connection()
    if not conn:
        print("Database connection failed in get_user_query")
        return None
    query_data = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, user_id, text, input_type, tag, created_at FROM user_queries WHERE id = %s", (query_id,))
        query_data = cursor.fetchone()
        if query_data:
            return UserQuery(**query_data)
    except Error as e:
        print(f"Error getting user query ID '{query_id}': {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
    return None

# --- Yeni Fonksiyon ---
def get_queries_by_user_id(user_id: int) -> List[UserQuery]:
    conn = get_db_connection()
    if not conn:
        print("Database connection failed in get_queries_by_user_id")
        return []
    queries = []
    try:
        cursor = conn.cursor(dictionary=True)
        # En son eklenenler üste gelecek şekilde sırala
        sql = """
            SELECT q.id, q.user_id, q.text, q.input_type, q.tag, q.created_at,
                   r.explanation, r.examples, r.usage_contexts
            FROM user_queries q
            LEFT JOIN llm_responses r ON q.id = r.query_id
            WHERE q.user_id = %s
            ORDER BY q.created_at DESC
        """
        cursor.execute(sql, (user_id,))
        results = cursor.fetchall()
        for row in results:
            # JSON string'lerini Python listelerine çevir
            if row.get('examples'):
                try:
                    row['examples'] = json.loads(row['examples'])
                except json.JSONDecodeError:
                    row['examples'] = ["Error decoding examples"] # Hata durumunda
            else:
                 row['examples'] = []

            if row.get('usage_contexts'):
                 try:
                     row['usage_contexts'] = json.loads(row['usage_contexts'])
                 except json.JSONDecodeError:
                     row['usage_contexts'] = ["Error decoding contexts"] # Hata durumunda
            else:
                row['usage_contexts'] = []

            # UserQuery şemasına uygun hale getir (LLM verilerini ekle)
            # Note: UserQuery schema might need adjustment or use a different combined schema
            query_with_response = UserQuery(**row)
            # Add LLM fields if needed, adjust schema or create a new one
            query_with_response.explanation = row.get('explanation')
            query_with_response.examples = row.get('examples')
            query_with_response.usage_contexts = row.get('usage_contexts')

            queries.append(query_with_response)

    except Error as e:
        print(f"Error getting queries for user ID '{user_id}': {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
    return queries
# --- Bitiş Yeni Fonksiyon ---


def save_llm_response(response_data: LLMResponseCreate):
    conn = get_db_connection()
    if not conn:
        print("Database connection failed in save_llm_response")
        raise ConnectionError("Database connection failed for saving LLM response.")
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO llm_responses (query_id, explanation, examples, usage_contexts)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            explanation = VALUES(explanation),
            examples = VALUES(examples),
            usage_contexts = VALUES(usage_contexts)
        """
        values = (
            response_data.query_id,
            response_data.explanation,
            json.dumps(response_data.examples),
            json.dumps(response_data.usage_contexts)
        )
        cursor.execute(sql, values)
        conn.commit()
        print(f"Saved/Updated LLM response for query ID: {response_data.query_id}")
    except Error as e:
        print(f"Database error saving LLM response: {e}")
        conn.rollback()
        raise e
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def create_user_table():
    conn = get_db_connection()
    if not conn:
        print("Database connection failed in create_user_table")
        return
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE,
                full_name VARCHAR(100),
                hashed_password VARCHAR(255) NOT NULL,
                disabled BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        conn.commit()
        print("Users table checked/created successfully.")
    except Error as e:
        print(f"Error creating users table: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def create_app_tables():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to DB for app table creation.")
        return
    try:
        cursor = conn.cursor()
        print("Creating 'user_queries' table if not exists...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_queries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT DEFAULT NULL,
                text VARCHAR(1000) NOT NULL,
                input_type VARCHAR(50) NOT NULL,
                tag VARCHAR(255) DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        print("Creating 'llm_responses' table if not exists...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS llm_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                query_id INT NOT NULL UNIQUE,
                explanation TEXT NOT NULL,
                examples JSON NOT NULL,
                usage_contexts JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (query_id) REFERENCES user_queries(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        conn.commit()
        print("Application tables checked/created successfully.")
    except Error as e:
        print(f"Error creating application tables: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
