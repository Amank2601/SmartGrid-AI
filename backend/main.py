from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
import mysql.connector
from mysql.connector import pooling
import random

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
    pool_size=5,
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
    except mysql.connector.Error as e:
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
    cursor.execute(
        "INSERT INTO energy_data (meter_id, energy_usage, voltage, current) VALUES (%s,%s,%s,%s)",
        (meter_id, energy, voltage, current)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"meter": meter_id, "energy": energy}


# ===============================
# 🚨 EVENTS (UPDATED 🔥)
# ===============================
def generate_event():
    events = [
        ("Power Failure", 101, False),
        ("Earth Fault", 102, True),
        ("Neutral Disturbance", 203, True),
        ("Magnet Tampering", 204, True),
        ("Plug Removal", 209, True),
    ]

    event_name, code, is_tamper = random.choice(events)
    status = random.choice(["Occurrence", "Restoration"])

    return event_name, code, is_tamper, status


@app.post("/meters/{meter_id}/events")
def add_event(meter_id: str):
    event_name, code, is_tamper, status = generate_event()

    conn, cursor = get_conn_cursor()

    # ✅ Prevent invalid restoration
    if status == "Restoration":
        cursor.execute("""
            SELECT * FROM events 
            WHERE meter_id=%s AND event_name=%s AND event_status='Occurrence'
            ORDER BY timestamp DESC LIMIT 1
        """, (meter_id, event_name))

        existing = cursor.fetchone()
        if not existing:
            status = "Occurrence"

    try:
        cursor.execute(
            "INSERT INTO events (meter_id, event_name, event_code, event_status, timestamp) VALUES (%s,%s,%s,%s,NOW())",
            (meter_id, event_name, code, status)
        )

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
        "tampering": is_tamper
    }


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
    cursor.execute(
        "SELECT * FROM events WHERE meter_id=%s ORDER BY timestamp DESC LIMIT 100",
        (meter_id,)
    )
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


# ===============================
# 🔐 LOGIN
# ===============================
@app.post("/login")
def login(username: str, password: str):
    conn, cursor = get_conn_cursor()

    cursor.execute(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (username, password)
    )

    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        raise HTTPException(401, "Invalid credentials")

    return {"message": "Login successful", "role": user["role"]}
