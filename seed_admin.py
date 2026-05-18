import os
import sys

parent_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, parent_dir)

from backend.database import init_db

print("Running init_db()...")
init_db()
print("Done!")
