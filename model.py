from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Text, ForeignKey, Boolean
from typing import List
from flask_login import UserMixin


class Base(DeclarativeBase):
    pass


class User(UserMixin, Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(nullable=False, unique=True)
    hash: Mapped[str] = mapped_column(nullable=False)
    tasks: Mapped[List["Task"]] = relationship(back_populates="user")

    def __repr__(self) -> str:
        return f"<User username={self.username}>"


class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    user: Mapped["User"] = relationship(back_populates="tasks")
    is_check: Mapped[int] = mapped_column(Boolean, nullable=False)

    def __repr__(self) -> str:
        return f"<Task text={self.text} by {self.user.username}>"

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "text": self.text, "is_check": self.is_check}
