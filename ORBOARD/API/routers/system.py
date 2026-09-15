from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from API.utils.yaml_io import load_yaml, save_yaml
import os, datetime

router = APIRouter()

GPIO_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "GPIO")
)

CONFIG_DIR = os.path.join(GPIO_DIR, "config")
ACTIVE_PATH = os.path.join(GPIO_DIR, "active.yaml")


class SelectPayload(BaseModel):
    line: str


@router.post("/select")
def select_line_model(payload: SelectPayload):
    line = payload.line.strip()
    model = payload.model.strip()

    config_path = os.path.join(CONFIG_DIR, f"{line}.yaml")
    if not os.path.exists(config_path):
        raise HTTPException(
            status_code=404,
            detail=f"Config not found: {line}"
        )

    config_data = load_yaml(config_path)

    active_data = {
        "line": line,
        # 🔥 เอาค่าจาก config มาใช้จริง
        "tt_sec": config_data.get("tt_sec"),
        "count_per_cycle_actual": config_data.get("count_per_cycle_actual"),
        "count_per_cycle_plan": config_data.get("count_per_cycle_plan"),
        "day_start": config_data.get("day_start"),
        "night_start": config_data.get("night_start"),
        "day_breaks": config_data.get("day_breaks", []),
        "night_breaks": config_data.get("night_breaks", []),

        "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": "frontend"
    }

    save_yaml(ACTIVE_PATH, active_data)
    return {"status": "ok", "active": active_data}
