from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
import mysql.connector
from mysql.connector import pooling
import random

from datetime import datetime, timedelta
from routes.analytics import router as analytics_router
from pydantic import BaseModel


class SupportMessage(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    message: str


app = FastAPI(title="Smart Meter Backend")

# ===============================
# 🌐 CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# 🔌 DB CONNECTION POOL
# ===============================
db_pool = pooling.MySQLConnectionPool(
    pool_name="smart_meter_pool",
    pool_size=20,
    host="localhost",
    user="root",
    password="Rageaman@0909",
    database="smart_meter",
)


def get_conn_cursor():
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    return conn, cursor

# ===============================
# 🧪 TEST
# ===============================


@app.get("/test-db")
def test_db():
    conn, cursor = get_conn_cursor()
    cursor.execute("SELECT 1 AS ok")
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return {"status": "DB connected", "ok": row["ok"]}

# ===============================
# 🧠 METER GENERATOR
# ===============================


def generate_meter_details():
    import time

    base = str(int(time.time() * 1000))[-7:]

    serial_number = f"MGSAEG{base}"
    device_id = f"ALL{serial_number}"
    logical_device_name = f"ALLIED-DLMS{random.randint(1, 999):03d}"
    firmware_version = f"AW{random.randint(20, 40)}.{random.randint(0, 99):02d}"

    meter_type = random.choice([
        "1-Ph Smart",
        "3-Ph Smart",
        "3-Ph LTCT",
        "3-Ph LTCT DT"
    ])

    if meter_type == "1-Ph Smart":
        category = "D1"
        current = random.choice(["(5-30)A", "(10-60)A"])
    elif meter_type == "3-Ph Smart":
        category = "D2"
        current = random.choice(["(10-60)A", "(20-100)A"])
    elif meter_type == "3-Ph LTCT":
        category = "Industrial"
        current = "CT Operated"
    else:
        category = "Utility"
        current = "Transformer Level"

    return {
        "meter_id": serial_number,
        "serial": serial_number,
        "device": device_id,
        "logical": logical_device_name,
        "firmware": firmware_version,
        "type": meter_type,
        "category": category,
        "current": current,
        "manufacturer": "Allied Engineering Works Pvt. Ltd."
    }

# ===============================
# 🔥 CREATE METER
# ===============================


@app.post("/meters")
def create_meter():
    data = generate_meter_details()

    conn, cursor = get_conn_cursor()
    try:
        cursor.execute("""
            INSERT INTO meters 
            (meter_id, serial_number, device_id, logical_device_name, firmware_version, 
             meter_type, meter_category, current_rating, manufacturer, location)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            data["meter_id"],
            data["serial"],
            data["device"],
            data["logical"],
            data["firmware"],
            data["type"],
            data["category"],
            data["current"],
            data["manufacturer"],
            "Delhi"
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

    return data

# ===============================
# ⚡ ENERGY DATA
# ===============================


def generate_data():
    return (
        round(random.uniform(1, 5), 3),
        round(random.uniform(210, 240), 2),
        round(random.uniform(1, 10), 2)
    )


@app.post("/meters/{meter_id}/data")
def add_energy_data(meter_id: str):
    energy, voltage, current = generate_data()

    conn, cursor = get_conn_cursor()

    fake_time = datetime.now() - timedelta(
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )

    cursor.execute(
        "INSERT INTO energy_data (meter_id, energy_usage, voltage, current, timestamp) VALUES (%s,%s,%s,%s,%s)",
        (meter_id, energy, voltage, current, fake_time)
    )

    conn.commit()
    cursor.close()
    conn.close()

    return {"meter": meter_id, "energy": energy}

# ===============================
# ✅ GET ENERGY DATA
# ===============================


@app.get("/meters/{meter_id}/data")
def get_energy_data(meter_id: str):

    conn = None
    cursor = None

    try:
        conn, cursor = get_conn_cursor()

        cursor.execute("""
            SELECT 
                DATE_FORMAT(timestamp, '%H:00') AS hour,
                ROUND(AVG(energy_usage), 2) AS `usage`
            FROM energy_data
            WHERE meter_id = %s
            AND timestamp >= NOW() - INTERVAL 24 HOUR
            GROUP BY DATE_FORMAT(timestamp, '%H:00')
            ORDER BY DATE_FORMAT(timestamp, '%H:00')
        """, (meter_id,))

        data = cursor.fetchall()

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ===============================
# 🚨 EVENTS
# ===============================


def generate_event(cursor, meter_id):
    events = [
        ("Neutral Disturbance", 203, True),
        ("Current Imbalance", 210, True),
        ("CT Bypass / Reversal", 211, True),
        ("Earth Fault", 102, True),

        ("Power Failure", 101, False),
        ("Over Voltage", 301, False),
        ("Under Voltage", 302, False),
        ("Voltage Imbalance", 303, False),

        ("Magnet Tampering", 204, True),
        ("Plug Removal", 209, True),
    ]

    event_name, code, is_tamper = random.choice(events)

    cursor.execute("""
        SELECT 
            SUM(CASE WHEN event_status='Occurrence' THEN 1 ELSE 0 END) AS occ,
            SUM(CASE WHEN event_status='Restoration' THEN 1 ELSE 0 END) AS res
        FROM events
        WHERE meter_id=%s AND event_name=%s
    """, (meter_id, event_name))

    row = cursor.fetchone()
    occ = row["occ"] or 0
    res = row["res"] or 0

    status = "Restoration" if occ > res else "Occurrence"

    return event_name, code, is_tamper, status


def get_random_duration():
    ranges = [(300, 1800), (1800, 3600), (3600, 7200), (7200, 14400)]
    low, high = random.choice(ranges)
    return timedelta(seconds=random.randint(low, high))


def get_random_past_time():
    return datetime.now() - timedelta(
        days=random.randint(0, 5),
        seconds=random.randint(0, 86400)
    )


@app.post("/meters/{meter_id}/events")
def add_event(meter_id: str):
    conn, cursor = get_conn_cursor()
    event_name, code, is_tamper, status = generate_event(cursor, meter_id)

    try:
        base_time = get_random_past_time()

        if status == "Occurrence":
            timestamp = base_time
        else:
            cursor.execute("""
                SELECT timestamp FROM events
                WHERE meter_id=%s AND event_name=%s AND event_status='Occurrence'
                ORDER BY timestamp DESC LIMIT 1
            """, (meter_id, event_name))
            last = cursor.fetchone()
            timestamp = last["timestamp"] + \
                get_random_duration() if last else base_time

        cursor.execute("""
            INSERT INTO events 
            (meter_id, event_name, event_code, event_status, timestamp) 
            VALUES (%s,%s,%s,%s,%s)
        """, (meter_id, event_name, code, status, timestamp))

        if is_tamper and status == "Occurrence":
            cursor.execute(
                "INSERT INTO tampering_logs (meter_id, reason) VALUES (%s,%s)",
                (meter_id, event_name)
            )

        conn.commit()

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()

    return {
        "event": event_name,
        "status": status,
        "time": timestamp,
        "tampering": is_tamper
    }

# ===============================
# 📅 MONTHLY DATA (FIXED PROPERLY)
# ===============================


@app.get("/meters/{meter_id}/monthly")
def get_monthly_data(meter_id: str):
    conn, cursor = get_conn_cursor()

    cursor.execute("""
        SELECT month, units, bill
        FROM monthly_usage
        WHERE meter_id=%s
        ORDER BY FIELD(month, 'Jan','Feb','Mar','Apr','May','Jun',
                             'Jul','Aug','Sep','Oct','Nov','Dec')
    """, (meter_id,))

    data = cursor.fetchall()

    if not data:
        months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
        generated = []

        for m in months:

            if m in ["Nov", "Dec", "Jan", "Feb"]:
                units = random.randint(400, 700)
            elif m == "Mar":
                units = random.randint(600, 900)
            else:
                units = random.randint(900, 1500)

            if units <= 200:
                bill = units * 4.5
            elif units <= 400:
                bill = 200 * 4.5 + (units - 200) * 6.5
            elif units <= 800:
                bill = 200 * 4.5 + 200 * 6.5 + (units - 400) * 8
            else:
                bill = (
                    200 * 4.5 +
                    200 * 6.5 +
                    400 * 8 +
                    (units - 800) * 9.5
                )

            bill = bill + 400 + (bill * 0.05)

            cursor.execute("""
                INSERT INTO monthly_usage (meter_id, month, units, bill)
                VALUES (%s, %s, %s, %s)
            """, (meter_id, m, units, round(bill, 2)))

            generated.append({
                "month": m,
                "units": units,
                "bill": round(bill, 2)
            })

        conn.commit()
        cursor.close()
        conn.close()
        return generated

    cursor.close()
    conn.close()
    return data
# ===============================
# 📊 FETCH APIs
# ===============================


@app.get("/meters")
def list_meters():
    conn, cursor = get_conn_cursor()
    cursor.execute("SELECT * FROM meters ORDER BY id DESC")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


@app.get("/meters/{meter_id}")
def get_meter(meter_id: str):
    conn, cursor = get_conn_cursor()
    cursor.execute("SELECT * FROM meters WHERE meter_id=%s", (meter_id,))
    meter = cursor.fetchone()
    cursor.close()
    conn.close()

    if not meter:
        raise HTTPException(404, "Meter not found")

    return meter


@app.get("/meters/{meter_id}/events")
def get_events(meter_id: str):
    conn, cursor = get_conn_cursor()
    cursor.execute("""
        SELECT event_name,event_code,event_status AS status,timestamp
        FROM events WHERE meter_id=%s ORDER BY timestamp ASC
    """, (meter_id,))
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

# ===============================
# 🔐 LOGIN
# ===============================


@app.post("/login")
def login(password: str):
    conn, cursor = get_conn_cursor()

    cursor.execute(
        "SELECT * FROM users WHERE password=%s",
        (password,)
    )

    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        raise HTTPException(401, "Invalid credentials")

    return {"message": "Login successful", "role": user["role"]}


# ===============================
# 📊 ANALYTICS ROUTER
# ===============================
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])


@app.post("/support")
def save_support(msg: SupportMessage):
    conn, cursor = get_conn_cursor()

    try:
        cursor.execute("""
            INSERT INTO support_messages (name, email, phone, subject, message)
            VALUES (%s, %s, %s, %s, %s)
        """, (msg.name, msg.email, msg.phone, msg.subject, msg.message))

        conn.commit()
        return {"status": "success"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
