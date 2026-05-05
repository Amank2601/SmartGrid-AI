import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom"; // ✅ ADDED

function ReportPage() {
  const [meters, setMeters] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [report, setReport] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventType, setEventType] = useState(null);

  const navigate = useNavigate(); // ✅ ADDED

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/meters")
      .then(res => setMeters(res.data))
      .catch(console.error);
  }, []);

  const options = meters.map(m => ({
    value: m.meter_id,
    label: `${m.meter_id} (${m.serial_number})`
  }));

  const eventCategories = {
    current: ["Earth", "Current"],
    voltage: ["Voltage", "Power"],
    other: ["Neutral", "Magnet", "Plug", "Import Export"]
  };

  const handleSelect = async (selected) => {
    const meterId = selected.value;
    setSelectedMeter(meterId);
    setEventType(null);
    setEvents([]);

    const res = await axios.get(
      `http://127.0.0.1:8000/meters/${meterId}`
    );
    setReport(res.data);
  };

  const processEvents = (events) => {
    const active = {};
    const result = [];

    events.forEach(e => {
      const key = e.event_name;

      if (e.status === "Occurrence") {
        active[key] = e;
      } else if (e.status === "Restoration" && active[key]) {
        const start = new Date(active[key].timestamp);
        const end = new Date(e.timestamp);

        const diff = end - start;

        const hrs = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

        result.push({
          event_name: key,
          start: start.toLocaleString(),
          end: end.toLocaleString(),
          duration: `${hrs}:${mins}:${secs}`
        });

        delete active[key];
      }
    });

    return result;
  };

  const loadEvents = async (type) => {
    setEventType(type);

    const res = await axios.get(
      `http://127.0.0.1:8000/meters/${selectedMeter}/events`
    );

    const filtered = res.data.filter(e =>
      eventCategories[type].some(name =>
        e.event_name.toLowerCase().includes(name.toLowerCase())
      )
    );

    const paired = processEvents(filtered);
    setEvents(paired);
  };

  // ✅ PDF DOWNLOAD
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Allied Engineering Works Pvt. Ltd.", 14, 15);

    doc.setFontSize(12);
    doc.text("Smart Meter Monitoring System", 14, 22);

    doc.text(`${eventType.toUpperCase()} Events Report`, 14, 30);

    autoTable(doc, {
      startY: 35,
      head: [["Field", "Value"]],
      body: [
        ["Meter ID", report.meter_id],
        ["Serial Number", report.serial_number],
        ["Device ID", report.device_id],
        ["Logical Device Name", report.logical_device_name],
        ["Firmware", report.firmware_version],
        ["Meter Type", report.meter_type],
        ["Category", report.meter_category],
        ["Current Rating", report.current_rating],
        ["Manufacturer", report.manufacturer],
        ["Location", report.location],
      ]
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Sr", "Event", "Start Time", "End Time", "Duration"]],
      body: events.map((e, i) => [
        i + 1,
        e.event_name,
        e.start,
        e.end,
        e.duration
      ])
    });

    doc.save(`${eventType}_report_${selectedMeter}.pdf`);
  };

  return (
    <div style={{ padding: "30px" }}>

      {/* ✅ BACK BUTTON */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#334155",
            color: "#e2e8f0",
            cursor: "pointer",
            transition: "0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#38bdf8";
            e.target.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#334155";
            e.target.style.color = "#e2e8f0";
          }}
        >
          ⬅ Back to Dashboard
        </button>
      </div>

      <h2 style={{ textAlign: "center" }}>
        Allied Engineering Works Pvt. Ltd.
      </h2>

      <p style={{ textAlign: "center" }}>
        Smart Meter Monitoring System
      </p>

      {/* DROPDOWN */}
      <div style={{ maxWidth: "400px", margin: "20px auto" }}>
        <Select
          options={options}
          placeholder="Search Meter ID or Serial..."
          onChange={handleSelect}
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "#0f172a",
              borderColor: "#38bdf8",
              color: "white"
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#1e293b"
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? "#38bdf8"
                : state.isFocused
                ? "#334155"
                : "#1e293b",
              color: state.isSelected ? "#0f172a" : "#ffffff"
            }),
            singleValue: (base) => ({
              ...base,
              color: "white"
            }),
            input: (base) => ({
              ...base,
              color: "white"
            }),
            placeholder: (base) => ({
              ...base,
              color: "#94a3b8"
            })
          }}
        />
      </div>

      {!selectedMeter && (
        <p style={{ textAlign: "center" }}>
          Select a meter to view report
        </p>
      )}

      {report && (
        <div className="card">
          <h3>Meter Details</h3>
          <p><b>Meter ID:</b> {report.meter_id}</p>
          <p><b>Type:</b> {report.meter_type}</p>
          <p><b>Serial:</b> {report.serial_number}</p>
          <p><b>Firmware:</b> {report.firmware_version}</p>
        </div>
      )}

      {report && (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => loadEvents("current")}>⚡ Current</button>
          <button onClick={() => loadEvents("voltage")}>🔌 Voltage</button>
          <button onClick={() => loadEvents("other")}>📦 Other</button>
        </div>
      )}

      {eventType && (
        <div style={{ marginTop: "30px" }}>
          <h3>{eventType.toUpperCase()} Events Report</h3>

          <table className="report-table">
            <thead>
              <tr>
                <th>Sr</th>
                <th>Event</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Time (HH:MM:SS)</th>
              </tr>
            </thead>

            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{e.event_name}</td>
                  <td>{e.start}</td>
                  <td>{e.end}</td>
                  <td>{e.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ CENTER BUTTON */}
          <div style={{ marginTop: "25px", display: "flex", justifyContent: "center" }}>
            <button onClick={downloadPDF}>
              ⬇ Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;