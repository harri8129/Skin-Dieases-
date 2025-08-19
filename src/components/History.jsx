import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button, Image } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

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

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image",
      render: (url) => <Image src={url} alt="Skin" width={60} height={60} />,
    },
    {
      title: "Prediction",
      dataIndex: "predicted_disease",
      key: "prediction",
    },
    {
      title: "Confidence",
      dataIndex: "predicted_confidence",
      key: "confidence",
      render: (value) => `${(value * 100).toFixed(2)}%`,
    },
    {
      title: "Date",
      dataIndex: "uploaded_at",
      key: "date",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => handleGenerateReport(record)}
        >
          Generate Report
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📜 History</h1>

      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={history}
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Detailed Report</h3>
                <p>
                  <strong>Symptoms:</strong> {record.symptoms || "N/A"}
                </p>
                <p>
                  <strong>Remedies:</strong> {record.remedies || "N/A"}
                </p>
                <p>
                  <strong>Cure:</strong> {record.cure || "N/A"}
                </p>
                <p>
                  <strong>Prevention:</strong> {record.prevention || "N/A"}
                </p>
              </div>
            ),
          }}
        />
      )}
    </div>
  );
}
