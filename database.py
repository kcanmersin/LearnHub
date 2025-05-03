# database.py
import mysql.connector
from mysql.connector import Error
import os

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_DATABASE"),
            port=int(os.getenv("DB_PORT", 3306)),
            ssl_disabled=True
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None
    except ValueError as e:
        print(f"Error reading database configuration (check DB_PORT): {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during DB connection: {e}")
        return None
    return None