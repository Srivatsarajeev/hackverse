import os
import sys

parent_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, parent_dir)

import bcrypt
from backend.database import admins_col

admin = admins_col.find_one({"username": "admin"})
if admin:
    print("Admin found!")
    password_to_check = "NeoTokyoControl2026!"
    if bcrypt.checkpw(password_to_check.encode(), admin["password"].encode()):
        print("Password MATCHES!")
    else:
        print("Password DOES NOT match!")
else:
    print("Admin NOT found!")
