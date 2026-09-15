import yaml
import os
import datetime


class ConfigLoader:
    def __init__(self, base_dir: str, line: str):
        self.base_dir = base_dir
        self.line = line

        self.path = os.path.join(
            self.base_dir, "config", f"{line}.yaml"
        )

        self.data: dict = {}

        if not os.path.exists(self.path):
            self._create_default()

        self.load()

    # =================================================
    # CREATE DEFAULT CONFIG
    # =================================================
    def _create_default(self):
        os.makedirs(os.path.dirname(self.path), exist_ok=True)

        self.data = {
            # =========================
            # identity
            # =========================
            "line": self.line,

            # =========================
            # production
            # =========================
            "tt_sec": 10.0,
            "count_per_cycle_actual": 1,
            "count_per_cycle_plan": 1,
            "threshold": 90,

            # =========================
            # shift
            # =========================
            "day_start": "08:00",
            "night_start": "20:00",

            # =========================
            # reset
            # =========================
            "reset_day_time": "07:50",
            "reset_night_time": "19:50",
            "reset_mode": "auto",        # auto | manual | disabled

            # =========================
            # realtime control
            # =========================
            "enable_realtime_pp": True,

            # =========================
            # breaks
            # =========================
            "day_breaks": [],
            "night_breaks": [],

            # =========================
            # system
            # =========================
            "enable": True,
            "timezone": "Asia/Bangkok",

            # =========================
            # meta
            # =========================
            "updated_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
        }

        self.save()
        print(f"[CONFIG] create default -> {self.path}")

    # =================================================
    # LOAD CONFIG
    # =================================================
    def load(self):
        with open(self.path, "r", encoding="utf-8") as f:
            self.data = yaml.safe_load(f) or {}

    # =================================================
    # SAVE CONFIG
    # =================================================
    def save(self):
        self.data["updated_at"] = datetime.datetime.now(
            datetime.timezone.utc
        ).strftime("%Y-%m-%d %H:%M:%S")

        with open(self.path, "w", encoding="utf-8") as f:
            yaml.safe_dump(
                self.data,
                f,
                allow_unicode=True,
                sort_keys=False,
            )

    # =================================================
    # RELOAD (ใช้ตอน API เปลี่ยนค่า)
    # =================================================
    def reload(self):
        self.load()

    # =================================================
    # FORCE ACTUAL (กด SET ACTUAL จาก HMI / Dashboard)
    # =================================================
    def set_force_actual(self, value: int):
        self.data["force_actual"] = int(value)
        self.save()

    # =================================================
    # GETTERS (ปลอดภัย)
    # =================================================
    def get_tt(self) -> float:
        return float(self.data.get("tt_sec", 1))

    def get_cycle_actual(self) -> int:
        return int(self.data.get("count_per_cycle_actual", 1))

    def get_cycle_plan(self) -> int:
        return int(self.data.get("count_per_cycle_plan", 1))

    def get_day_start(self) -> str:
        return self.data.get("day_start", "08:00")

    def get_night_start(self) -> str:
        return self.data.get("night_start", "20:00")

    def get_reset_mode(self) -> str:
        return self.data.get("reset_mode", "auto")

    def is_realtime_pp_enabled(self) -> bool:
        return bool(self.data.get("enable_realtime_pp", True))

    def get_breaks(self, shift: str) -> list:
        """
        shift = "day" | "night"
        """
        if shift == "night":
            return self.data.get("night_breaks", [])
        return self.data.get("day_breaks", [])

    # =================================================
    # DEBUG
    # =================================================
    def dump(self) -> dict:
        return self.data
