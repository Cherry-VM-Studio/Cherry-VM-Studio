import logging
from typing import Any, Callable, Generic, Optional, Type, TypeVar
from uuid import UUID
from pydantic import BaseModel, model_validator
from psycopg import sql

from .main import pool
from .simple_select import select_schema_one, select_schema_dict
from .models import InvalidFieldNameException, RecordNotFoundException

logger = logging.getLogger(__name__)


KeyType = TypeVar("KeyType", str, int, UUID)
DBModel = TypeVar("DBModel", bound=BaseModel)
MainModel = TypeVar("MainModel", bound=BaseModel)
CreationModel = TypeVar("CreationModel", bound=BaseModel)


class SimpleTableManager(BaseModel, Generic[DBModel, MainModel, CreationModel]):
    table_name: str
    allowed_fields_for_select: set[str]
    model: Type[MainModel]
    model_in_db: Type[DBModel]
    model_creation_args: Type[CreationModel] | None = None
    prepare_record: Callable[[DBModel], MainModel]
    
    
    @model_validator(mode="after")
    def ensure_uuid_in_allowed_fields_for_select(self):
        self.allowed_fields_for_select.add("uuid")
        return self
    
    
    def get_record_by_field(self, field_name: str, value: Any) -> Optional[MainModel]:
        
        if field_name not in self.allowed_fields_for_select:
            logging.error(f"[SimpleTableManager:{self.table_name}] Invalid field name '{field_name}' passed to get_by_field(). Allowed fields: {sorted(self.allowed_fields_for_select)}")
            raise InvalidFieldNameException(field_name=field_name)
        
        record = select_schema_one(self.model_in_db, f"SELECT * FROM {self.table_name} WHERE {field_name} = (%s)", (value,))
        
        return self.prepare_record(record) if record is not None else None
        
        
    def get_record_by_fields(self, fields: dict[str, str]) -> Optional[MainModel]:
        
        for field_name in fields.keys():
            if field_name not in self.allowed_fields_for_select:
                logging.error(f"[SimpleTableManager:{self.table_name}] Invalid field name '{field_name}' passed to get_by_field(). Allowed fields: {sorted(self.allowed_fields_for_select)}")
                raise InvalidFieldNameException(field_name=field_name)
            
        query = f"""
            SELECT * FROM {self.table_name} 
            WHERE {' AND '.join([f'{field} = %({field})s' for field in fields.keys()])}
        """
            
        record = select_schema_one(self.model_in_db, query, fields)
        
        return self.prepare_record(record) if record is not None else None

        
    def get_record_by_uuid(self, uuid: UUID) -> Optional[MainModel]:
        return self.get_record_by_field("uuid", str(uuid))
    
    
    def get_all_records(self) -> dict[UUID, MainModel]:
        
        records = select_schema_dict(self.model_in_db, "uuid", f"SELECT * FROM {self.table_name}")
        
        for uuid, record in records.items():
            records[uuid] = self.prepare_record(record)
            
            
        return records
    
    def get_all_records_matching(self, field_name: str, value: Any | list[Any]) -> dict[UUID, MainModel]:
        
        if field_name not in self.allowed_fields_for_select:
            logging.error(f"[SimpleTableManager:{self.table_name}] Invalid field name '{field_name}' passed to get_all_records_matching(). Allowed fields: {sorted(self.allowed_fields_for_select)}")
            raise InvalidFieldNameException(field_name=field_name)
        
        if isinstance(value, list):
            if not len(value):
                return {}
            
            base_query = "SELECT * FROM {table} WHERE {field} IN ({placeholders})"
            placeholders=sql.SQL(', ').join(sql.Placeholder() * len(value))
            params = value
        else:
            base_query = "SELECT * FROM {table} WHERE {field} = {placeholders}"
            placeholders=sql.Placeholder()
            params = [value]
        
        query = sql.SQL(base_query).format(
            table=sql.Identifier(self.table_name),
            field=sql.Identifier(field_name),
            placeholders=placeholders
        )
        
        records = select_schema_dict(self.model_in_db, "uuid", query, params)
        
        for key, record in records.items():
            records[key] = self.prepare_record(record)
        
        return records
    
    
    def create_record(self, form: CreationModel):
        if self.model_creation_args is None:
            logging.error(f"[SimpleTableManager:{self.table_name}] Tried to create a record in a SimpleTableManager instance without a creation model.")
            return RuntimeError
        
        fields = sorted(form.model_fields_set)
        fields_sql = sql.SQL(', ').join(map(sql.Identifier, fields))
        values_sql = sql.SQL(', ').join(sql.Placeholder(name) for name in fields)
        
        query = sql.SQL("INSERT INTO {table} ({fields}) VALUES ({values})").format(
            table=sql.Identifier(self.table_name),
            fields=fields_sql,
            values=values_sql
        )
        
        with pool.connection() as connection:
            with connection.cursor() as cursor: 
                with connection.transaction():
                    cursor.execute(query, form.model_dump())
              
                    
    def remove_record(self, uuid: UUID):
        record = self.get_record_by_uuid(uuid)
        
        if record is None:
            raise RecordNotFoundException(uuid=uuid)
        
        query = sql.SQL("DELETE FROM {table} WHERE uuid = {value}").format(
            table=sql.Identifier(self.table_name),
            value=uuid
        )
        
        with pool.connection() as connection:
            with connection.cursor() as cursor: 
                with connection.transaction():
                    cursor.execute(query)
                    
    
    def modify_record_field(self, uuid: UUID, field_name: str, new_value):
        record = self.get_record_by_uuid(uuid)
        
        if record is None:
            raise RecordNotFoundException(uuid=uuid)
        
        query = sql.SQL("UPDATE {table} SET {field_name} = %s WHERE uuid = %s").format(
            table=sql.Identifier(self.table_name),
            field_name=sql.Identifier(field_name),
        )
        
        with pool.connection() as connection:
            with connection.cursor() as cursor: 
                with connection.transaction():
                    cursor.execute(query, (new_value, uuid))
                    