import datetime
import time
import os
import yaml
import sys
import threading
import ASUS.GPIO as GPIO

from engin_core.config_loader import ConfigLoader
from engin_core.state_control import StateControl
from engin_core.reset_manager import check_and_reset, _do_reset
from engin_core.calculator import (
    calc_pp_plan_realtime,
    calc_eff,
)



# =========================================================
# BASE
# =========================================================
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BASE_DIR = os.environ.get(
    "ORBOARD_BASE_DIR",
    os.path.dirname(os.path.abspath(__file__))
)

# =========================================================
# BASE  (FIX FOR GPIO/dist STRUCTURE)
# =========================================================
if getattr(sys, "frozen", False):
    exe_dir = os.path.dirname(os.path.abspath(sys.executable))
    BASE_DIR = os.path.abspath(os.path.join(exe_dir, ".."))
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("================================")
print("BASE_DIR =", BASE_DIR)
print("EXECUTABLE =", sys.executable)
print("================================")

# if "ORBOARD_BASE_DIR" in os.environ:
#     BASE_DIR = os.environ["ORBOARD_BASE_DIR"]
# elif getattr(sys, "frozen", False):
#     BASE_DIR = os.path.dirname(sys.executable)
# else:
#     BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# print("### BASE_DIR =", BASE_DIR)

# =========================================================
# GPIO CONFIG (ASUS / Tinker Board)
# =========================================================
# PIN_COUNT = 22   # COUNT
# PIN_RESET = 29   # RESET

# GPIO.setmode(GPIO.BOARD)
# GPIO.setup(PIN_COUNT, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# GPIO.setup(PIN_RESET, GPIO.IN, pull_up_down=GPIO.PUD_UP)


GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

PIN_COUNT = 22   # BOARD 15  (GPIO22)
PIN_RESET = 29   # BOARD 29  (GPIO5)

GPIO.setup(PIN_COUNT, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(PIN_RESET, GPIO.IN, pull_up_down=GPIO.PUD_UP)



# =========================================================
# LOAD ACTIVE
# =========================================================
def load_active():
    path = os.path.join(BASE_DIR, "active.yaml")

    # ค่า default
    default_active = {
        "line": "default"
    }

    # ❌ ยังไม่มีไฟล์ → สร้างอัตโนมัติ
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            yaml.safe_dump(
                default_active,
                f,
                allow_unicode=True,
                sort_keys=False
            )
        print("[ACTIVE] active.yaml created (default)")
        return default_active

    # ✅ มีไฟล์แล้ว → โหลด
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or default_active

    # กันไฟล์ว่าง / โครงสร้างพัง
    if "line" not in data:
        data["line"] = "default"

    return data


# =========================================================
# INIT
# =========================================================
active = load_active()
LINE = active.get("line", "default")

config = ConfigLoader(BASE_DIR, LINE)
state = StateControl(BASE_DIR, LINE)

# =========================================================
# 🔥 RESTORE STATE (RETENTIVE)
# =========================================================
state.actual = 0
state.actual_hour = 0
state.pp_plan = 0
state.plan_per_hour = 0
state.eff = 0.0
state.hourly = {}
state.pp_hourly = {}

# ===== runtime (PP realtime) =====
now = datetime.datetime.now()
state.runtime = {
    "pp_plan": 0,
    "pp_remainder_sec": 0.0,
    "last_ts": now,
    "in_break": False,
}

state.dump_state() 

print(f"[ENGINE] BOOT  LINE={LINE} PP={state.pp_plan} ACT={state.actual}")

# =========================================================
# RELOAD ENGINE (เปลี่ยน LINE)
# =========================================================
def reload_engine(new_active):
    global LINE, config, state

    new_line = new_active.get("line")
    if not new_line or new_line == LINE:
        return False

    print(f"[ENGINE RELOAD] {LINE} → {new_line}")

    LINE = new_line
    config = ConfigLoader(BASE_DIR, LINE)
    state = StateControl(BASE_DIR, LINE)

    now = datetime.datetime.now()
    state.runtime = {
        "pp_plan": 0,
        "pp_remainder_sec": 0.0,
        "last_ts": now,
        "in_break": False,
    }

    state.pp_hourly = {}
    state.actual = 0
    state.actual_hour = 0
    state.hourly = {}
    state.just_reset = False

    state.dump_state()
    print(f"[ENGINE READY] LINE={LINE}")
    return True


def gpio_loop():
    last_count = GPIO.input(PIN_COUNT)
    last_reset = GPIO.input(PIN_RESET)

    print("[GPIO] INIT",
          "COUNT =", last_count,
          "RESET =", last_reset)

    while True:
        count_now = GPIO.input(PIN_COUNT)
        reset_now = GPIO.input(PIN_RESET)

        if count_now != last_count:
            print(f"[GPIO] COUNT PIN {last_count} -> {count_now}")

        if reset_now != last_reset:
            print(f"[GPIO] RESET PIN {last_reset} -> {reset_now}")

        # COUNT BUTTON (ACTIVE LOW)
        if last_count == 1 and count_now == 0:
            now = datetime.datetime.now()

            print("[GPIO] COUNT TRIGGER")

            inc = config.get_cycle_actual()
            state.count_actual(now, inc)

            print(f"[GPIO] ACTUAL = {state.actual}")

        # RESET BUTTON (ACTIVE LOW)
        if last_reset == 1 and reset_now == 0:
            now = datetime.datetime.now()

            print("[GPIO] RESET TRIGGER")

            _do_reset(state, now, "MANUAL")

            state.runtime = {
                "pp_plan": 0,
                "pp_remainder_sec": 0.0,
                "last_ts": datetime.datetime.now(),
                "in_break": False,
            }

            state.just_reset = True
            state.dump_state()

            print("[GPIO] RESET DONE")

        last_count = count_now
        last_reset = reset_now

        time.sleep(0.05)


# =========================================================
# SYSTEM LOOP
# =========================================================
def system_tick():
    skip_after_reset = False
    last_hour_key = None
    while True:
        active = load_active()
        if reload_engine(active):
            time.sleep(0.1)
            continue

        now = datetime.datetime.now()
        config.reload()

        #resetactual per  hour
        hour_key = now.strftime("%Y%m%d%H")

        if last_hour_key != hour_key:
            print(">> NEW HOUR - RESET ACTUAL_H <<")

            state.actual_hour = 0
            state.hourly = {}

            last_hour_key = hour_key
            state.dump_state()


        # FORCE RESET BY MINUTE
        current_hm = now.strftime("%H:%M")

        if current_hm == config.data.get("reset_day_time") or \
           current_hm == config.data.get("reset_night_time"):

            print(">>> FORCE RESET <<<")

            _do_reset(state, now, "AUTO")

            state.runtime["last_ts"] = datetime.datetime.now()
            state.runtime["pp_plan"] = 0
            state.runtime["pp_remainder_sec"] = 0.0
            state.runtime["in_break"] = False

            state.dump_state()

            skip_after_reset = True
            time.sleep(1)
            continue

        # ORIGINAL RESET LOGIC
        if check_and_reset(now, config.data, state):
            state.runtime["last_ts"] = datetime.datetime.now()
            state.runtime["pp_plan"] = 0
            state.runtime["pp_remainder_sec"] = 0.0
            state.runtime["in_break"] = False


            state.dump_state()

            print(">>> Reset By Time <<")

            skip_after_reset = True
            time.sleep(1)
            continue

        if skip_after_reset:
            skip_after_reset = False
            time.sleep(0.1)
            continue

        # SHIFT SELECT
        day_start = datetime.time.fromisoformat(
            config.data.get("day_start", "08:00")
        )
        night_start = datetime.time.fromisoformat(
            config.data.get("night_start", "20:00")
        )

        current_time = now.time()

        if day_start <= current_time < night_start:
            current_shift = "day"
        else:
            current_shift = "night"

        # WAIT FOR SHIFT START (FIX BUG)
        if current_shift == "day" and current_time < day_start:
            state.runtime["last_ts"] = datetime.datetime.now()
            state.runtime["pp_remainder_sec"] = 0.0
            time.sleep(0.1)
            continue

        if current_shift == "day":
            breaks = config.data.get("day_breaks", [])
        else:
            breaks = config.data.get("night_breaks", [])
        

        print("NOW = ", now.time())
        print("SHIFT", current_shift)
        print("BREAK = ", breaks )

        # =====================================================
        # 🔥 BREAK CHECK (หยุดจริง + ไม่เลื่อน TT)
        # =====================================================
        in_break_now = False

        for b in breaks:
            start = datetime.time.fromisoformat(b["start"])
            end = datetime.time.fromisoformat(b["end"])
            if start <= now.time() < end:
                in_break_now = True
                break

        if in_break_now:
            print(">>> IN BREAK <<<")

            # reset delta time ให้แม่น
            state.runtime["in_break"] = True
            state.runtime["last_ts"] = datetime.datetime.now()
            state.runtime["pp_remainder_sec"] = 0.0

            state.dump_state()
            time.sleep(1)
            continue

        # Detect break exit
        if state.runtime.get("in_break") and not in_break_now:
            print(">> BREAK EXIT <<")

            state.runtime["in_break"] = False 

            tt = float(config.data.get("tt_sec", 1))
            state.runtime["last_ts"] = datetime.datetime.now() - datetime.timedelta(seconds=tt)

        # =====================================================
        # PP PLAN REALTIME
        # =====================================================
        pp_plan, _ = calc_pp_plan_realtime(
            now=datetime.datetime.now(),  # 🔥 ใช้ now ใหม่เสมอ
            config=config.data,
            breaks=breaks,
            state=state.runtime,
        )

        # ---------- PP HOURLY ----------
        hour_key = now.strftime("%Y%m%d%H")
        baseline = state.pp_hourly.get(hour_key)

        if baseline is None:
            state.pp_hourly[hour_key] = pp_plan
            baseline = pp_plan
            print(f"[PP-HOURLY] BASELINE {hour_key} = {baseline}")

        plan_per_hour = max(0, pp_plan - baseline)

        # ---------- KPI ----------
        eff = calc_eff(state.actual, pp_plan) if pp_plan > 0 else 0.0

        state.pp_plan = pp_plan
        state.plan_per_hour = plan_per_hour
        state.eff = eff

        state.extra = {"pp_hourly": state.pp_hourly}
        state.dump_state()

        print(
            f"[CALC] LINE={LINE} "
            f"PP={pp_plan} "
            f"PH={plan_per_hour} "
            f"ACT={state.actual} "
            f"ACT_H={state.actual_hour} "
            f"EFF={eff:.1f}%"
        )

        # realtime loop 100ms
        time.sleep(1)




if __name__ == "__main__":
    print("OR BOARD ENGINE (GPIO FULL)")

    t1 = threading.Thread(target=system_tick, daemon=True)
    t1.start()

    t2 = threading.Thread(target=gpio_loop, daemon=True)
    t2.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        GPIO.cleanup()
        print("GPIO CLEANUP")
