import sqlite3
import bcrypt

def update_user_hashes():
    conn = sqlite3.connect("backend/urbaneye.db")
    cursor = conn.cursor()
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(b"UrbanEye@2026", salt).decode('utf-8')
    cursor.execute("UPDATE users SET hashed_password = ?", (hashed,))
    conn.commit()
    print(f"Updated {cursor.rowcount} users with bcrypt password hash.")

    cursor.execute("SELECT id, email, role, full_name FROM users")
    for row in cursor.fetchall():
        print(f"User {row[0]}: {row[1]} ({row[2]}) - {row[3]}")
    conn.close()

if __name__ == "__main__":
    update_user_hashes()
