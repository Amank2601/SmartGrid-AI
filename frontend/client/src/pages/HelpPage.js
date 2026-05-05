import { useNavigate } from "react-router-dom";

function HelpPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px" }}>

      {/* 🔙 BACK BUTTON */}
      <button 
        onClick={() => navigate("/dashboard")}
        className="back-btn"
      >
        ← Back to Dashboard
      </button>

      <h1 className="help-title">
        Connect with AEW Team
      </h1>

      {/* 🔥 MAIN SECTION */}
      <div className="help-container">

        {/* 🔥 LEFT FORM */}
        <div className="card help-form">

          <input placeholder="Full Name" className="form-input" />
          <input placeholder="Email" className="form-input" />

          <div className="row">
            <input placeholder="Phone" className="form-input" />
          </div>

          <p className="label">Select Subject</p>

          <div className="checkbox-row">
            <label><input type="checkbox" /> General</label>
            <label><input type="checkbox" /> Job</label>
            <label><input type="checkbox" /> Product</label>
            <label><input type="checkbox" /> Support</label>
          </div>

          <textarea 
            placeholder="Message"
            className="form-input textarea"
          />

          <button className="primary-btn">
            Send Message
          </button>

        </div>

        

      </div>

      {/* 🔥 CONTACT SECTION */}
      <h2 className="contact-title">Contact Info</h2>

      <div className="contact-grid">

        <div className="card">
          <h3>Registered Office</h3>
          <p>M-11 Industrial Estate, Badli, Delhi 110042</p>
        </div>

        <div className="card">
          <h3>Branch Office</h3>
          <p>C-13, SMA Industrial Area, Jahangirpuri, Delhi-110033</p>
        </div>

        <div className="card">
          <h3>Support</h3>
          <p>📞 +91 920 586 8181</p>
          <p>✉ support@aewinfra.com</p>
        </div>

      </div>

    </div>
  );
}

export default HelpPage;