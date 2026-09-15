import datetime

def is_in_break(now, breaks):
    """
    ตรวจว่า now อยู่ในช่วง break ที่ enable อยู่หรือไม่
    รองรับ key: enabled / enable
    """

    if not breaks:
        return False

    for br in breaks:
        # --- รองรับทั้ง enabled และ enable ---
        enabled = br.get("enabled", br.get("enable", True))
        if not enabled:
            continue

        try:
            bs = datetime.time.fromisoformat(str(br["start"]))
            be = datetime.time.fromisoformat(str(br["end"]))
        except Exception:
            # format เวลาไม่ถูก → ข้าม
            continue

        now_t = now.time()

        # --- กรณี break ไม่ข้ามวัน ---
        if bs <= be:
            if bs <= now_t <= be:
                return True
        # --- กรณี break ข้ามวัน (เช่น 23:00 - 01:00) ---
        else:
            if now_t >= bs or now_t <= be:
                return True

    return False