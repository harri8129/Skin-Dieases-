import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Spin, message } from "antd";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/userimages/history/", {
      method: "GET",
      credentials: "include", // ✅ keep session cookie
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history");
        return res.json();
      })
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        message.error("Error fetching history");
        setLoading(false);
      });
  }, []);

  const handleGenerateReport = (item) => {
    const reportData = `
      📝 Skin Disease Report

      📌 Disease: ${item.predicted_disease}
      🔢 Confidence: ${(item.predicted_confidence * 100).toFixed(2)}%
      🧾 Symptoms: ${item.symptoms || "N/A"}
      💊 Remedies: ${item.remedies || "N/A"}
      🩺 Cure: ${item.cure || "N/A"}
      🛡 Prevention: ${item.prevention || "N/A"}

      📅 Uploaded at: ${new Date(item.uploaded_at).toLocaleString()}
    `;

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${item.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    message.success("Report generated successfully!");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📜 History</h1>

      {history.length === 0 ? (
        <p>No history available.</p>
      ) : (
        <Row gutter={[16, 16]}>
          {history.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt="Skin upload"
                    src={item.image_url}
                    className="h-56 object-cover"
                  />
                }
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleGenerateReport(item)}
                    block
                  >
                    📑 Generate Report
                  </Button>,
                ]}
              >
                <h3 className="font-semibold text-lg">
                  🦠 {item.predicted_disease}
                </h3>
                <p>
                  <strong>Confidence:</strong>{" "}
                  {(item.predicted_confidence * 100).toFixed(2)}%
                </p>
                <p>
                  <strong>Symptoms:</strong> {item.symptoms || "N/A"}
                </p>
                <p>
                  <strong>Remedies:</strong> {item.remedies || "N/A"}
                </p>
                <p>
                  <strong>Cure:</strong> {item.cure || "N/A"}
                </p>
                <p>
                  <strong>Prevention:</strong> {item.prevention || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  📅 {new Date(item.uploaded_at).toLocaleString()}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
