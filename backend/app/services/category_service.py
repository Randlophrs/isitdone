from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Session, select

from ..models.category import Category
from ..models.routine import Routine
from ..schemas.category import CategoryCreate, CategoryUpdate
from ..utils.ids import generate_id


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_category(session: Session, data: CategoryCreate) -> Category:
    existing = session.exec(
        select(Category).where(Category.name == data.name)
    ).first()
    if existing:
        return existing
    category = Category(id=generate_id(), **data.model_dump())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def get_category(session: Session, category_id: str) -> Optional[Category]:
    return session.get(Category, category_id)


def list_categories(session: Session) -> list[Category]:
    return list(
        session.exec(select(Category).order_by(Category.name.asc())).all()
    )


def update_category(
    session: Session, category: Category, data: CategoryUpdate
) -> Category:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def delete_category(session: Session, category: Category) -> None:
    # Detach routines first so they become Uncategorized rather than orphaned.
    routines = session.exec(
        select(Routine).where(Routine.category_id == category.id)
    ).all()
    for r in routines:
        r.category_id = None
        session.add(r)
    session.delete(category)
    session.commit()


def count_routines_using(session: Session, category_id: str) -> int:
    return len(
        session.exec(
            select(Routine.id).where(Routine.category_id == category_id)
        ).all()
    )
