#!/usr/bin/env python
"""One-time bootstrap: create the initial Admin user.

Usage:
    python seed_admin.py --email admin@itflow.com --password "Admin@123" --name "ITFlow Admin"

Refuses to create a duplicate (idempotent: safe to run again).
Does NOT seed demo data, issues, employees, or any other records.
"""
import argparse
import sys

# Ensure the app package is importable when run from the backend/ directory
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models import user as _  # noqa: ensure all models are imported before create_all
from app.models.user import User, UserRole, UserStatus


def main():
    parser = argparse.ArgumentParser(description="Create the initial ITFlow admin user")
    parser.add_argument("--email",    required=True, help="Admin email address")
    parser.add_argument("--password", required=True, help="Admin password (will be hashed)")
    parser.add_argument("--name",     required=True, help="Admin display name")
    args = parser.parse_args()

    email    = args.email.strip().lower()
    password = args.password
    name     = args.name.strip()

    if not email or "@" not in email:
        sys.exit("ERROR: --email must be a valid email address.")
    if len(password) < 6:
        sys.exit("ERROR: --password must be at least 6 characters.")
    if not name:
        sys.exit("ERROR: --name cannot be empty.")

    # Ensure tables exist (idempotent)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email.ilike(email)).first()
        if existing:
            print(f"✗  User '{email}' already exists (id={existing.id}, role={existing.role.value}).")
            print("   No changes made.")
            sys.exit(0)

        admin = User(
            email=email,
            name=name,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE.value,
            avatar_color="#22d3ee",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"✓  Admin created successfully.")
        print(f"   ID:    {admin.id}")
        print(f"   Email: {admin.email}")
        print(f"   Name:  {admin.name}")
        print(f"   Role:  {admin.role.value}")
        print()
        print("   Start the backend and log in at http://localhost:5173/login")
    finally:
        db.close()


if __name__ == "__main__":
    main()
