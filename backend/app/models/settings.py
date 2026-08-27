from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.user import gen_id


class SLARule(Base):
    __tablename__ = "sla_rules"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    priority: Mapped[str] = mapped_column(String, unique=True, index=True)  # e.g. "Critical", "High", "Medium", "Low" or "CRITICAL"
    response_target: Mapped[str] = mapped_column(String)  # e.g. "15 min"
    resolution_target: Mapped[str] = mapped_column(String)  # e.g. "30 min"
    response_minutes: Mapped[int] = mapped_column(Integer, default=15)
    resolution_minutes: Mapped[int] = mapped_column(Integer, default=30)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    code: Mapped[str | None] = mapped_column(String, nullable=True)
