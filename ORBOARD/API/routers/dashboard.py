from fastapi import APIRouter
from API.utils.yaml_io import load_yaml
import os

router = APIRouter()

# =========================
# BASE DIR
# =========================
BASE_DIR = os.environ.get(
    "ORBOARD_BASE_DIR",
    "/home/linaro/ORBOARD/GPIO"
)


# =========================
# LIVE STATE
# =========================
@router.get("/live")
def get_live():
    active_path = os.path.join(BASE_DIR, "active.yaml")
    active = load_yaml(active_path)

    if not active:
        return {"error": "no active"}

    line = active.get("line")
    if not line:
        return {"error": "no line in active.yaml"}

    state_path = os.path.join(BASE_DIR, "state", f"{line}.yaml")
    if not os.path.exists(state_path):
        return {"error": f"state not found: {line}"}

    return load_yaml(state_path)
