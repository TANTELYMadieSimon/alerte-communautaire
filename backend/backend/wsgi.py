"""
WSGI config for backend project.
It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
import sys
from pathlib import Path  # 🔹 import nécessaire

# 🔹 ajouter le parent de backend à sys.path pour que Django trouve les apps
sys.path.append(str(Path(__file__).resolve().parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.backend.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
