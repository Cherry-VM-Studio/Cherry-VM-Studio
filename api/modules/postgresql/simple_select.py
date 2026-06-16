from typing import Any, Optional, Type, TypeVar
import psycopg
from psycopg.sql import Composed
from pydantic import BaseModel
from .models import Params
from .main import pool

T = TypeVar("T", bound=BaseModel)



def select_one(query: str | Composed, params: Params | None = None) -> dict[str, Any] | None:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params) #type: ignore[arg-type]
            row = cursor.fetchone()
    return row



def select_rows(query: str | Composed, params: Params | None = None) -> list[dict[str, Any]]:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params) #type: ignore[arg-type]
            rows = cursor.fetchall()
    return rows



def select_single_field(key_name: str, query: str | Composed, params: Params | None = None) -> list[Any]:
    rows = select_rows(query, params)
    return [row[key_name] for row in rows]



def select_schema(model: Type[T], query: str | Composed, params: Params | None = None) -> list[Any]:
    rows = select_rows(query, params)
    return [model.model_validate(row) for row in rows]



def select_schema_dict(model: Type[T], key_name: str, query: str | Composed, params: Params | None = None) -> dict[Any, Any]:
    rows = select_rows(query, params)
    return {row[key_name]: model.model_validate(row) for row in rows}



def select_schema_one(model: Type[T], query: str | Composed | Composed, params: Params | None = None) -> Optional[T]:
    row = select_one(query, params)
    if not row:
        return None
    return model.model_validate(row)