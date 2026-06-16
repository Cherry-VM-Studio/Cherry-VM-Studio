import logging
import psycopg_pool
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool
from config.database_config import DATABASE_CONFIG

logger = logging.getLogger(__name__)

pool = psycopg_pool.ConnectionPool(
    conninfo=f"dbname={DATABASE_CONFIG.dbname} user={DATABASE_CONFIG.user} "
             f"host={DATABASE_CONFIG.host} port={DATABASE_CONFIG.port} "
             f"password={DATABASE_CONFIG.password}",
    min_size=1,  
    max_size=DATABASE_CONFIG.max_connections,
    timeout=DATABASE_CONFIG.timeout_seconds,
    kwargs={
        "row_factory": dict_row, # ensure that query results are returned as a dictionary
    },
)

async_pool = AsyncConnectionPool(
    conninfo=f"dbname={DATABASE_CONFIG.dbname} user={DATABASE_CONFIG.user} "
             f"host={DATABASE_CONFIG.host} port={DATABASE_CONFIG.port} "
             f"password={DATABASE_CONFIG.password}",
    min_size=1,  
    max_size=DATABASE_CONFIG.max_connections,
    timeout=DATABASE_CONFIG.timeout_seconds,
    kwargs={
        "row_factory": dict_row, # ensure that query results are returned as a dictionary
    },
    open=False
)

async def open_async_pool():
    await async_pool.open()
    logger.debug("Async psycopg pool open.")

async def close_async_pool():
    await async_pool.close()
    logger.debug("Async psycopg pool closed.")