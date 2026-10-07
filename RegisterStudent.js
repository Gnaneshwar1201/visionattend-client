import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { loadModels, detectSingleFace, faceapi } from "../utils/faceApi";

export default function RegisterStudent() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ name: "", rollNo: "", email: "" });
  const [descriptors, setDescriptors] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    loadModels()
      .then(() => setReady(true))
      .catch(() => setMsg("Failed to load AI models"));
  }, []);

  const capture = async () => {
    if (!ready) return;
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== 4) return;

    const result = await detectSingleFace(video);
    if (!result) {
      setMsg("⚠️ No face detected. Look straight at the camera.");
      return;
    }

    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    const resized = faceapi.resizeResults(result, displaySize);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, [resized]);

    setDescriptors((d) => [...d, Array.from(result.descriptor)]);
    setPhotos((p) => [...p, webcamRef.current.getScreenshot()]);
    setMsg(
      `✅ Captured sample ${descriptors.length + 1}. Add ${Math.max(0, 3 - descriptors.length - 1)} more.`,
    );
  };

  const save = async () => {
    if (!form.name || !form.rollNo)
      return setMsg("Name and Roll No are required");
    if (descriptors.length < 3)
      return setMsg("Capture at least 3 face samples");

    setBusy(true);
    try {
      const { data: student } = await api.post("/students", form);
      for (let i = 0; i < descriptors.length; i++) {
        await api.post(`/students/${student._id}/faces`, {
          descriptor: descriptors[i],
          photo: photos[i],
        });
      }
      setMsg("✅ Student registered successfully!");
      setTimeout(() => nav("/students"), 800);
    } catch (e) {
      setMsg(e.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setDescriptors([]);
    setPhotos([]);
    setMsg("");
  };

  return (
    <div>
      <h1>Register Student</h1>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Student Info</h3>
          <label>Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label>Roll No *</label>
          <input
            value={form.rollNo}
            onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
          />
          <label>Email (optional)</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <h3 style={{ marginTop: 22, marginBottom: 8 }}>
            Face Samples ({descriptors.length}/3+)
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
            Look straight, click Capture. Turn head slightly, capture again. Add
            3–5 samples for best accuracy.
          </p>
          <button onClick={capture} disabled={!ready}>
            {ready ? "📸 Capture Face" : "⏳ Loading models…"}
          </button>
          <button
            className="secondary"
            style={{ marginLeft: 8 }}
            onClick={reset}
          >
            Reset
          </button>
          <button style={{ marginLeft: 8 }} onClick={save} disabled={busy}>
            {busy ? "Saving…" : "💾 Save Student"}
          </button>
          {msg && (
            <p
              style={{
                marginTop: 12,
                color: msg.startsWith("✅") ? "#4ade80" : "#fbbf24",
                fontSize: 13,
              }}
            >
              {msg}
            </p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Camera</h3>
          <div
            style={{
              position: "relative",
              borderRadius: 8,
              overflow: "hidden",
              background: "#000",
            }}
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
              style={{ width: "100%", display: "block", borderRadius: 8 }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
          {photos.length > 0 && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt=""
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: "cover",
                    borderRadius: 6,
                    border: "2px solid #3b82f6",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
