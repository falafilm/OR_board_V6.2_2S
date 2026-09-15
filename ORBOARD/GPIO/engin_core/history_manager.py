# engin_core/history_manager.py
import os
import yaml
import datetime

def snapshot(state, payload: dict):
    if not payload or "shift" not in payload:
        return None

    payload = payload.copy()
    shift = payload.pop("shift")
    if shift not in ("day", "night"):
        return None

    base_dir = state.base_dir
    line = state.line

    today = datetime.date.today().isoformat()
    save_dir = os.path.join(base_dir, "history", line)
    os.makedirs(save_dir, exist_ok=True)

    path = os.path.join(save_dir, f"{today}_{shift}.yaml")

    data = {
        "date": today,
        "shift": shift,
        "line": line,
        **payload,
        "saved_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            old = yaml.safe_load(f) or []
        if not isinstance(old, list):
            old = [old]
        old.append(data)
        save_data = old
    else:
        save_data = [data]

    with open(path, "w", encoding="utf-8") as f:
        yaml.safe_dump(save_data, f, allow_unicode=True, sort_keys=False)

    print(f"[HISTORY SAVED] {path}")
    return path
