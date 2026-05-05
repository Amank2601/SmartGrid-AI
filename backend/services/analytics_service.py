import random
from mysql.connector import pooling

# DB POOL (same config)
db_pool = pooling.MySQLConnectionPool(
    pool_name="analytics_pool",
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
# 📊 OVERVIEW
# ===============================
def get_overview_data():
    conn, cursor = get_conn_cursor()

    cursor.execute("SELECT COUNT(*) as total FROM meters")
    total = cursor.fetchone()["total"]

    cursor.execute(
        "SELECT COUNT(*) as count FROM meters WHERE status='active'")
    active = cursor.fetchone()["count"]

    cursor.execute(
        "SELECT COUNT(*) as count FROM meters WHERE status='inactive'")
    inactive = cursor.fetchone()["count"]

    cursor.execute(
        "SELECT COUNT(*) as count FROM meters WHERE status='expired'")
    expired = cursor.fetchone()["count"]

    cursor.close()
    conn.close()

    return {
        "total": total,
        "active": active,
        "inactive": inactive,
        "expired": expired
    }


# ===============================
# ⚡ FAULT DATA (REAL DB)
# ===============================
def get_fault_data():
    conn, cursor = get_conn_cursor()

    cursor.execute("""
        SELECT event_name, COUNT(*) as count
        FROM events
        GROUP BY event_name
        ORDER BY count DESC
    """)

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {"name": row["event_name"], "count": row["count"]}
        for row in data
    ]


# ===============================
# 📈 USAGE DATA (FAKE FOR NOW)
# ===============================
def get_usage_data():
    return [
        {"time": "00:00", "usage": random.randint(1, 5)},
        {"time": "04:00", "usage": random.randint(2, 6)},
        {"time": "08:00", "usage": random.randint(3, 8)},
        {"time": "12:00", "usage": random.randint(4, 10)},
        {"time": "16:00", "usage": random.randint(5, 12)},
        {"time": "20:00", "usage": random.randint(3, 9)},
    ]
