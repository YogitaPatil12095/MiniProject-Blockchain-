import React, { useState, useEffect } from "react";
import { usePHR } from "../hooks/usePHR";
import { useWallet } from "../context/WalletContext";
import { MEDICAL_SPECIALTIES, TIME_SLOTS } from "../lib/constants";
import { truncateAddress } from "../lib/contract";
import { Calendar, Clock, CheckCircle, AlertTriangle, Stethoscope, User, PlusCircle } from "lucide-react";

export default function AppointmentPage() {
  const { account } = useWallet();
  const {
    fetchRegisteredDoctors,
    getDoctorProfileByAddress,
    bookAppointment,
    fetchPatientAppointments,
    fetchDoctorAppointments,
    updateAppointmentStatus,
  } = usePHR();

  const [doctors, setDoctors] = useState([]);
  const [patientAppts, setPatientAppts] = useState([]);
  const [doctorAppts, setDoctorAppts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({ state: "idle", message: "", txHash: "" });

  const [selectedSpecialty, setSelectedSpecialty] = useState(MEDICAL_SPECIALTIES[0]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);

  const loadData = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const docAddresses = await fetchRegisteredDoctors();
      const docsWithProfiles = await Promise.all(
        docAddresses.map(async (addr) => {
          const profile = await getDoctorProfileByAddress(addr);
          return {
            address: addr,
            name: profile?.fullName || "Doctor",
            specialty: profile?.specialty || "General Medicine",
            qualification: profile?.qualification || "MBBS, MD",
            location: profile?.location || "Hospital Main Wing",
          };
        })
      );
      setDoctors(docsWithProfiles);
      if (docsWithProfiles.length > 0 && !selectedDoctor) {
        setSelectedDoctor(docsWithProfiles[0].address);
      }

      const [pAppts, dAppts] = await Promise.all([
        fetchPatientAppointments(account),
        fetchDoctorAppointments(account),
      ]);
      setPatientAppts(pAppts);
      setDoctorAppts(dAppts);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      alert("Please select an available doctor.");
      return;
    }

    setActionStatus({ state: "pending", message: "Booking appointment slot on blockchain...", txHash: "" });
    try {
      const dateTimestamp = Math.floor(new Date(selectedDate).getTime() / 1000);
      const res = await bookAppointment(selectedDoctor, selectedSpecialty, dateTimestamp, selectedSlot);
      setActionStatus({ state: "success", message: "Appointment request successfully submitted!", txHash: res.txHash });
      await loadData();
    } catch (err) {
      setActionStatus({ state: "error", message: err.message, txHash: "" });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #0f766e 0%, #0369a1 100%)",
          color: "#fff",
          borderRadius: "var(--radius-xl)",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Calendar size={28} color="#67e8f9" />
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>Hospital Consultation Scheduling</h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
            Select specialist doctors, view available slots, book appointments directly via smart contracts, and track approval status.
          </p>
        </div>
      </div>

      {/* Action Notification */}
      {actionStatus.state !== "idle" && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "var(--radius-lg)",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              actionStatus.state === "pending"
                ? "#FEF3C7"
                : actionStatus.state === "success"
                ? "#DCFCE7"
                : "#FEE2E2",
            color:
              actionStatus.state === "pending"
                ? "#92400E"
                : actionStatus.state === "success"
                ? "#166534"
                : "#991B1B",
            border: `1px solid ${
              actionStatus.state === "pending"
                ? "#FDE68A"
                : actionStatus.state === "success"
                ? "#86EFAC"
                : "#FECACA"
            }`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {actionStatus.state === "success" && <CheckCircle size={18} />}
            {actionStatus.state === "error" && <AlertTriangle size={18} />}
            <span>{actionStatus.message}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Booking Form + Appointments Lists */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
        {/* Booking Card */}
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <PlusCircle size={18} color="var(--primary-600)" />
            <span>Book New Appointment</span>
          </h3>

          <form onSubmit={handleBook} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Select Medical Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              >
                {MEDICAL_SPECIALTIES.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Select Doctor & Availability
              </label>
              {doctors.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 8, backgroundColor: "var(--bg)", borderRadius: 6 }}>
                  No doctors registered yet. Please register a doctor in the Admin portal.
                </div>
              ) : (
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
                >
                  {doctors.map((d, i) => (
                    <option key={i} value={d.address}>
                      {d.name} — {d.specialty} ({truncateAddress(d.address)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Consultation Date
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                Open Time Slot
              </label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              >
                {TIME_SLOTS.map((slot, i) => (
                  <option key={i} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={actionStatus.state === "pending" || doctors.length === 0}
              style={{
                backgroundColor: "var(--primary-600)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Request Appointment (Requires Gas)
            </button>
          </form>
        </div>

        {/* Appointments List Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Patient's Appointments */}
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: 16, color: "var(--text)" }}>My Booked Appointments</h3>
            {patientAppts.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>You have no booked appointments.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {patientAppts.map((a) => (
                  <div
                    key={a.appointmentId}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "var(--bg)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                        {a.doctorName || "Doctor Consultation"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.specialty}</div>
                      <div style={{ fontSize: 11, color: "var(--primary-600)", marginTop: 2 }}>
                        {new Date(a.dateTimestamp * 1000).toLocaleDateString()} at {a.timeSlot}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor:
                            a.status === "Confirmed"
                              ? "#DCFCE7"
                              : a.status === "Pending"
                              ? "#FEF3C7"
                              : "#F3F4F6",
                          color:
                            a.status === "Confirmed"
                              ? "#166534"
                              : a.status === "Pending"
                              ? "#92400E"
                              : "#374151",
                        }}
                      >
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctor's Incoming Appointments */}
          {doctorAppts.length > 0 && (
            <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: 16, color: "var(--text)" }}>Doctor Consultation Queue</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {doctorAppts.map((a) => (
                  <div
                    key={a.appointmentId}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "var(--bg)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                        Patient: {a.patientName || truncateAddress(a.patientAddress)}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--primary-600)" }}>{a.timeSlot}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: a.status === "Confirmed" ? "#DCFCE7" : "#FEF3C7",
                          color: a.status === "Confirmed" ? "#166534" : "#92400E",
                        }}
                      >
                        {a.status}
                      </span>
                      {a.status === "Pending" && (
                        <button
                          onClick={() => handleStatusUpdate(a.appointmentId, "Confirmed")}
                          style={{
                            backgroundColor: "var(--primary-600)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
