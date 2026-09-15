import datetime


def _parse_time(t: str):
    if not t:
        return None
    try:
        return datetime.time.fromisoformat(str(t))
    except Exception:
        return None



def check_and_reset(now: datetime.datetime, config_data: dict, state):
    """
    AUTO reset จากเวลาที่ frontend ส่งมา
    reset ได้เฉพาะช่วง: reset_time <= now < start_time
    """
    now_time = now.time()
    today = now.strftime("%Y%m%d")

    reset_day_time = _parse_time(config_data.get("reset_day_time"))
    day_start = _parse_time(config_data.get("day_start"))

    reset_night_time = _parse_time(config_data.get("reset_night_time"))
    night_start = _parse_time(config_data.get("night_start"))

    last_reset_key = getattr(state, "last_reset_key", None)

    # ================= NIGHT RESET =================
    if reset_night_time and night_start:
        if reset_night_time <= now_time < night_start:
            key = f"{today}_NIGHT_{reset_night_time}_{night_start}"
            if last_reset_key != key:
                _do_reset(state, now, "NIGHT")
                state.last_reset_key = key
                state.dump_state()
                print(f"[AUTO RESET] NIGHT WINDOW {reset_night_time}-{night_start}")
                return True

    # ================= DAY RESET =================
    if reset_day_time and day_start:
        if reset_day_time <= now_time < day_start:
            key = f"{today}_DAY_{reset_day_time}_{day_start}"
            if last_reset_key != key:
                _do_reset(state, now, "DAY")
                state.last_reset_key = key
                state.dump_state()
                print(f"[AUTO RESET] DAY WINDOW {reset_day_time}-{day_start}")
                return True

    return False


# =================================================
# RESET CORE (AUTO + MANUAL)
# =================================================
def _do_reset(state, now: datetime.datetime, reset_type: str):
    """
    reset_type = "DAY" | "NIGHT" | "MANUAL"
    """

    # ===== KPI =====
    state.actual = 0
    state.actual_hour = 0
    state.pp_plan = 0
    state.plan_per_hour = 0
    state.eff = 0.0

    # ===== hourly =====
    state.hourly = {}
    state.pp_hourly = {}

    # ===== realtime runtime =====
    state.runtime = {
        "pp_plan": 0,
        "pp_remainder_sec": 0.0,
        "last_ts": now,
    }

    # ===== flags =====
    state.att_sec = 0.0
    state.just_reset = True

    if reset_type == "MANUAL":
        # 🔵 manual reset → ทำงานต่อทันที
        state.waiting_for_start = False
        state.waiting_start_type = None
        print("[MANUAL RESET] start immediately")
    else:
        # 🔴 auto reset → รอเวลา start
        state.waiting_for_start = True
        state.waiting_start_type = reset_type
        print(f"[AUTO RESET] {reset_type} waiting for shift start")
