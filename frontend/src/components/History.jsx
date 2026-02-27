import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button, Image } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import api, { getAccessToken } from '../utils/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use the API utility with automatic token handling
    api.get('/userimages/history/')
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

  // Download PDF report using the API utility
  const handleDownloadReport = (item) => {
    const accessToken = getAccessToken();
    
    fetch(`http://localhost:8000/api/userimages/${item.id}/download-report/`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to download report");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `Skin_Report_${item.id}.pdf`; // PDF file
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        message.success("Report downloaded successfully!");
      })
      .catch((err) => {
        console.error(err);
        message.error("Error downloading report");
      });
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
          onClick={() => handleDownloadReport(record)}
        >
          Download Report
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
