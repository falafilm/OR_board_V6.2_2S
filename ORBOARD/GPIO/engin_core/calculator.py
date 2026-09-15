

import datetime

# =================================================
# REALTIME PP PLAN (ทั้งกะ) ✅ TARGET หลัก
# =================================================
def calc_pp_plan_realtime(
    now: datetime.datetime,
    config: dict,
    breaks: list,
    state: dict,
):
    """
    Realtime PP Plan
    - tt_sec เช่น 2.4 → ทุก 2.4 วินาที เพิ่ม count
    - รองรับ break
    - reset ทำจากภายนอกด้วยการ reset state
    """

    # ---------- init ----------
    if state.get("last_ts") is None:
        state["last_ts"] = now
        state.setdefault("pp_plan", 0)
        state.setdefault("pp_remainder_sec", 0.0)
        return state["pp_plan"], state["pp_remainder_sec"]

    # ---------- delta time ----------
    delta_sec = (now - state["last_ts"]).total_seconds()
    state["last_ts"] = now

    if delta_sec <= 0:
        return state["pp_plan"], state["pp_remainder_sec"]

    # ---------- check break ----------
    for br in breaks or []:
        if not br.get("enabled", True):
            continue

        try:
            bs = datetime.time.fromisoformat(str(br["start"]))
            be = datetime.time.fromisoformat(str(br["end"]))
        except Exception:
            continue

        bs_dt = datetime.datetime.combine(now.date(), bs)
        be_dt = datetime.datetime.combine(now.date(), be)
        if be_dt <= bs_dt:
            be_dt += datetime.timedelta(days=1)

        if bs_dt <= now <= be_dt:
            return state["pp_plan"], state["pp_remainder_sec"]

    # ---------- accumulate ----------
    state["pp_remainder_sec"] += delta_sec

    tt = float(config.get("tt_sec", 1))
    # cycle = int(config.get("count_per_cycle", 1))
    cycle = int(config.get("count_per_cycle_plan", 1))

    if tt <= 0:
        return state["pp_plan"], state["pp_remainder_sec"]

    # ---------- realtime counting ----------
    while state["pp_remainder_sec"] >= tt:
        state["pp_plan"] += cycle
        state["pp_remainder_sec"] -= tt

    return state["pp_plan"], state["pp_remainder_sec"]

# เพิ่ม function สำหรับ actual
def calc_actual_realtime(
    now: datetime.datetime,
    config: dict,
    breaks: list,
    state: dict,
):
    if state.get("last_ts") is None:
        state["last_ts"] = now
        state.setdefault("actual", 0)
        state.setdefault("actual_remainder_sec", 0.0)
        return state["actual"], state["actual_remainder_sec"]

    delta_sec = (now - state["last_ts"]).total_seconds()
    state["last_ts"] = now

    if delta_sec <= 0:
        return state["actual"], state["actual_remainder_sec"]

    # break check
    for br in breaks or []:
        if not br.get("enabled", True):
            continue

        try:
            bs = datetime.time.fromisoformat(str(br["start"]))
            be = datetime.time.fromisoformat(str(br["end"]))
        except Exception:
            continue

        bs_dt = datetime.datetime.combine(now.date(), bs)
        be_dt = datetime.datetime.combine(now.date(), be)
        if be_dt <= bs_dt:
            be_dt += datetime.timedelta(days=1)

        if bs_dt <= now <= be_dt:
            return state["actual"], state["actual_remainder_sec"]

    state["actual_remainder_sec"] += delta_sec

    tt = float(config.get("tt_sec", 1))
    cycle = int(config.get("count_per_cycle_actual", 1))

    if tt <= 0:
        return state["actual"], state["actual_remainder_sec"]

    while state["actual_remainder_sec"] >= tt:
        state["actual"] += cycle
        state["actual_remainder_sec"] -= tt

    return state["actual"], state["actual_remainder_sec"]



# =================================================
# RESET STATE (ขึ้นกะ / reset manual)
# =================================================
def reset_pp_plan_state(state: dict):
    state["pp_plan"] = 0
    state["pp_remainder_sec"] = 0.0
    state["last_ts"] = None


# =================================================
# BREAK SEC IN 1 HOUR
# =================================================
def calc_break_sec_in_hour(
    hour_start: datetime.datetime,
    breaks: list
) -> int:
    hour_end = hour_start + datetime.timedelta(hours=1)
    break_sec = 0

    for br in breaks or []:
        if not br.get("enabled", True):
            continue

        try:
            bs = datetime.time.fromisoformat(str(br["start"]))
            be = datetime.time.fromisoformat(str(br["end"]))
        except Exception:
            continue

        bs_dt = datetime.datetime.combine(hour_start.date(), bs)
        be_dt = datetime.datetime.combine(hour_start.date(), be)

        if be_dt <= bs_dt:
            be_dt += datetime.timedelta(days=1)

        overlap_start = max(hour_start, bs_dt)
        overlap_end = min(hour_end, be_dt)

        if overlap_end > overlap_start:
            break_sec += (overlap_end - overlap_start).total_seconds()

    return int(break_sec)


# =================================================
# PLAN PER HOUR (TARGET รายชั่วโมง)
# =================================================
def calc_plan_per_hour(
    tt_sec: float,
    count_per_cycle_plan: int,
    hour_start: datetime.datetime,
    breaks: list
):
    if tt_sec <= 0:
        return 0

    break_sec = calc_break_sec_in_hour(hour_start, breaks)
    worked_sec = max(0, 3600 - break_sec)

    return int((worked_sec / tt_sec) * count_per_cycle_plan)


# =================================================
# DIFF (รายชั่วโมง)
# =================================================
# def calc_diff(actual_hour: int, plan_per_hour: int):
#     return actual_hour - plan_per_hour


# =================================================
# EFF (รายชั่วโมง)
# =================================================
def calc_eff(actual_hour: int, pp_plan: int):
    if pp_plan <= 0:
        return 0.0
    return round((actual_hour / pp_plan) * 100, 1)


# =================================================
# LOSS TIME (sec) – รายชั่วโมง
# =================================================
def calc_loss_time(diff: int, tt_sec: float):
    if diff >= 0:
        return 0
    return int(abs(diff) * tt_sec)


# =================================================
# SEC → HH:MM:SS
# =================================================
def sec_to_hms(seconds: int):
    if seconds <= 0:
        return "00:00:00"

    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"
