import sqlite3
from app.core.security import verify_password

conn = sqlite3.connect("itflow.db")
cursor = conn.cursor()

row = cursor.execute(
    "SELECT password_hash FROM users WHERE email = ?",
    ("admin@itflow.com",)
).fetchone()

if row is None:
    print("ERROR: admin user not found")
else:
    password_hash = row[0]
    print("HASH:", password_hash)
    print("VERIFY:", verify_password("Admin@123", password_hash))

conn.close()