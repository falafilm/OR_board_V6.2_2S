# engine_core/force_manager.py
import yaml, datetime, os

def force_actual(state, new_value):
    old = state["actual"]
    state["actual"] = new_value
    state["actual_hour"] = 0

    log = {
        "time": datetime.datetime.now().isoformat(),
        "old": old,
        "new": new_value
    }

    os.makedirs("force_log", exist_ok=True)
    with open("force_log/force.yaml", "a") as f:
        yaml.safe_dump([log], f)
    print(f"[FORCE] actual changed from {old} to {new_value}")