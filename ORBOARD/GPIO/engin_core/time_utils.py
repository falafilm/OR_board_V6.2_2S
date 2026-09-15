# engin_core/time_utils.py
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

# ตั้ง timezone โรงงาน
TZ = ZoneInfo("Asia/Bangkok")


def now_utc():
    """
    เวลาปัจจุบันแบบ UTC (เวลาโลก)
    """
    return datetime.now(timezone.utc)


def utc_to_local(dt_utc: datetime):
    """
    แปลง UTC -> Local Time (Asia/Bangkok)
    """
    return dt_utc.astimezone(TZ)
