from fastapi import APIRouter, HTTPException
from API.utils.yaml_io import load_yaml, save_yaml
import os, datetime


router = APIRouter()

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "GPIO")
)

CONFIG_DIR = os.path.join(BASE_DIR, "config")
ACTIVE_PATH = os.path.join(BASE_DIR, "active.yaml")


@router.get("/{line}")
def get_config(line: str):
    path = os.path.join(CONFIG_DIR, f"{line}.yaml")
    data = load_yaml(path)
    if not data:
        raise HTTPException(status_code=404, detail="config not found")
    return data


@router.put("/{line}")
def update_config_partial(line: str, payload: dict):
    path = os.path.join(CONFIG_DIR, f"{line}.yaml")

    old = load_yaml(path) or {}
    new_data = {**old, **payload}
    new_data["updated_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    save_yaml(path, new_data)
    return {"status": "ok", "config": new_data}


@router.post("/{line}")
def save_config_and_activate(line: str, payload: dict):
    config_path = os.path.join(CONFIG_DIR, f"{line}.yaml")
    save_yaml(config_path, payload)

    active_data = {
        "line": line,
        "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": "config_api"
    }
    save_yaml(ACTIVE_PATH, active_data)

    return {
        "status": "ok",
        "active": active_data
    }

