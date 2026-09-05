from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.route import Route

router = APIRouter(prefix="/api/routes", tags=["Routes"])

@router.get("")
async def get_routes(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Route))
    routes = res.scalars().all()
    return routes
