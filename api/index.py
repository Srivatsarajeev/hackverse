import os
import sys

# Add the project root to the python path so the backend module can be found
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from backend.main import app
