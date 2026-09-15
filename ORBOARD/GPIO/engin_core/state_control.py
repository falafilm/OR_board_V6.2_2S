# engin_core/state_control.py
import os
import yaml
import datetime


class StateControl:
    def __init__(self, base_dir, line):
        self.base_dir = base_dir
        self.line = line

        # =========================
        # RUNTIME STATE
        # =========================
        self.actual = 0
        self.actual_hour = 0

        self.pp_plan = 0
        self.plan_per_hour = 0
        self.eff = 0.0
        self.att_sec = 0.0
        
        # self.last_count_time = 0.0
        self.hourly = {}
        self.pp_hourly = {}   # ✅ FIX: กัน crash
        
        self.waiting_for_start = False
        self.just_reset = False


        self._load_state()

    # =================================================
    # LOAD STATE
    # =================================================
    def _load_state(self):
        path = self._state_path()
        if not os.path.exists(path):
            return

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}

            self.actual = data.get("actual", self.actual)
            self.actual_hour = data.get("actual_hour", 0)

            self.pp_plan = data.get("pp_plan", 0)
            self.plan_per_hour = data.get("plan_per_hour", 0)
            self.eff = data.get("eff", 0.0)
            

            self.att_sec = data.get("att_sec", 0.0)
            
            
  
            # self.loss_time = data.get("loss_time", "00:00:00")
            self.hourly = data.get("hourly", {}) or {}
            self.pp_hourly = data.get("pp_hourly", {}) or {}
            
        except Exception as e:
            print("[STATE LOAD ERROR]", e)

    # =================================================
    # COUNT (นับต่อได้ทันทีหลัง force)
    # =================================================
    def count_actual(self, now: datetime.datetime, tt_sec: float = None, count_per_cycle: int = 1, ):
        
         # 🔒 BLOCK COUNT ระหว่างรอ start กะใหม่
        if getattr(self, "waiting_for_start", False):
            return
        
        count_per_cycle = int(count_per_cycle)

        # ---------- ACTUAL ----------
        self.actual += count_per_cycle
        

        hour_key = now.strftime("%H")
        self.hourly.setdefault(hour_key, 0)
        self.hourly[hour_key] += count_per_cycle
        self.actual_hour = self.hourly[hour_key]

        self.dump_state()

    # =================================================
    # FORCE ACTUAL จากหน้าเว็บ (ตัวแก้ปัญหาหลัก)
    # =================================================
    # def set_actual_from_frontend(self, value: int):
    #     value = int(value)
    #     old_actual = self.actual
    #     self.actual = value

    #     now = datetime.datetime.now()

    #     # ⭐ จุดสำคัญที่สุด
    #     # self.last_count_time = now
    #     self.att_sec = 0.0

    #     self.dump_state()

    def set_actual_from_frontend(self, value: int):
        value = int(value)
        self.actual = value

        now = datetime.datetime.now()
        hour_key = now.strftime("%Y%m%d%H")

        self.hourly[hour_key] = value
        self.actual_hour = value

        self.att_sec = 0.0

        self.dump_state()
    # =================================================
    # RESET
    # =================================================
    def reset(self):
        self.actual = 0
        self.actual_hour = 0
        self.pp_plan = 0
        self.plan_per_hour = 0
        self.eff = 0.0
        # self.diff = 0
        self.att_sec = 0.0
        
       
        self.hourly = {}
        self.pp_hourly = {}
        self.dump_state()

    # =================================================
    # DUMP STATE
    # =================================================
    def dump_state(self):
        os.makedirs(os.path.join(self.base_dir, "state"), exist_ok=True)

        data = {
            "line": self.line,
            "actual": self.actual,
            "actual_hour": self.actual_hour,
            "pp_plan": self.pp_plan,
            "plan_per_hour": self.plan_per_hour,
            "eff": self.eff,
     
            "hourly": self.hourly,
            # "pp_hourly": getattr(self, "pp_hourly", {}), 
            "pp_hourly": self.pp_hourly, 
            "updated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        with open(self._state_path(), "w", encoding="utf-8") as f:
            yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)

    def _state_path(self):
        return os.path.join(
            self.base_dir, "state", f"{self.line}.yaml"
        )
