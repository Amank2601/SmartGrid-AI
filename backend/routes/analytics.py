from fastapi import APIRouter
from services.analytics_service import (
    get_overview_data,
    get_fault_data,
    get_usage_data
)

router = APIRouter()

# ===============================
# 📊 OVERVIEW API
# ===============================


@router.get("/overview")
def analytics_overview():
    return get_overview_data()


# ===============================
# ⚡ FAULT ANALYTICS
# ===============================
@router.get("/faults")
def analytics_faults():
    return get_fault_data()


# ===============================
# 📈 USAGE ANALYTICS
# ===============================
@router.get("/usage")
def analytics_usage():
    return get_usage_data()
