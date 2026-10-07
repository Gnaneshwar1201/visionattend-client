import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import api from "../api/axios";
import { loadModels, detectAllFaces, faceapi } from "../utils/faceApi";

export default function AttendanceMark() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cooldownRef = useRef({});
  const [students, setStudents] = useState([]);
  const [ready, setReady] = useState(false);
  const [log, setLog] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      loadModels(),
      api.get("/students/with-descriptors").then((r) => r.data),
    ])
      .then(([, data]) => {
        setStudents(data);
        setReady(true);
      })
      .catch(() => setError("Failed to load models or students"));
  }, []);

  useEffect(() => {
    if (!scanning || !ready) return;
    const id = setInterval(scan, 700);
    return () => clearInterval(id);
  }, [scanning, ready, students]);

  const scan = async () => {
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== 4) return;

    const detections = await detectAllFaces(video);
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    const resized = faceapi.resizeResults(detections, displaySize);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const labeled = students
      .filter((s) => s.faceDescriptors?.length)
      .map(
        (s) =>
          new faceapi.LabeledFaceDescriptors(
            s.rollNo,
            s.faceDescriptors.map((d) => new Float32Array(d)),
          ),
      );

    if (!labeled.length) return;
    const matcher = new faceapi.FaceMatcher(labeled, 0.55);

    for (const det of detections) {
      const match = matcher.findBestMatch(det.descriptor);
      const box = resized.detection?.box || det.detection.box;

      if (match.label !== "unknown") {
        const student = students.find((s) => s.rollNo === match.label);
        const confidence = 1 - match.distance;

        new faceapi.draw.DrawBox(box, {
          label: `${student.name} (${(confidence * 100).toFixed(0)}%)`,
          boxColor: "lime",
        }).draw(canvas);

        const now = Date.now();
        if (
          !cooldownRef.current[student.rollNo] ||
          now - cooldownRef.current[student.rollNo] > 10000
        ) {
          cooldownRef.current[student.rollNo] = now;
          try {
            const { data } = await api.post("/attendance", {
              studentId: student._id,
              confidence,
            });
            setLog((l) => [{ ...data, confidence }, ...l].slice(0, 20));
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        new faceapi.draw.DrawBox(box, {
          label: "Unknown",
          boxColor: "red",
        }).draw(canvas);
      }
    }
  };

  return (
    <div>
      <h1>Mark Attendance</h1>
      {error && (
        <div className="card" style={{ color: "#f87171" }}>
          {error}
        </div>
      )}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button onClick={() => setScanning((s) => !s)} disabled={!ready}>
              {scanning
                ? "⏸ Stop Scanning"
                : ready
                  ? "▶ Start Scanning"
                  : "⏳ Loading…"}
            </button>
            <button className="secondary" onClick={() => setLog([])}>
              Clear Log
            </button>
          </div>
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
          <p style={{ marginTop: 12, fontSize: 13, color: "#94a3b8" }}>
            {scanning ? "🟢 Scanning live…" : "⏸ Stopped"} •{" "}
            {students.filter((s) => s.faceDescriptors?.length).length} students
            registered
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Live Log</h3>
          {log.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              No attendance marked yet.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l, i) => (
                  <tr key={i}>
                    <td>{l.student?.name}</td>
                    <td>{l.time}</td>
                    <td>
                      <span className={`badge ${l.status}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
