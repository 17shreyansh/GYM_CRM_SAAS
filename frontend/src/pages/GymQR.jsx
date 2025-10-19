import React, { useState, useEffect } from 'react';
import { Card, QRCode, Typography, Space, Button, message, Row, Col, Alert, Divider } from 'antd';
import { 
  QrcodeOutlined, 
  ReloadOutlined, 
  PrinterOutlined, 
  DownloadOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  ScanOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const GymQR = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateQR();
  }, []);

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gym/attendance/gym-qr');
      setQrData(response.data);
    } catch (error) {
      message.error('Failed to generate QR code');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const qrElement = document.getElementById('qr-code-container');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Gym QR Code - ${qrData?.gym}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 40px;
              background: white;
            }
            .qr-container {
              border: 2px solid #2563eb;
              border-radius: 16px;
              padding: 40px;
              display: inline-block;
              background: white;
            }
            h1 { color: #1e293b; margin-bottom: 20px; }
            h2 { color: #2563eb; margin: 20px 0; }
            .instructions {
              margin-top: 30px;
              text-align: left;
              max-width: 400px;
              margin-left: auto;
              margin-right: auto;
            }
            .step {
              margin: 10px 0;
              padding: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${qrData?.gym}</h1>
            <h2>Member Check-in QR Code</h2>
            ${qrElement.innerHTML}
            <div class="instructions">
              <h3>How to use:</h3>
              <div class="step">1. Open your gym mobile app</div>
              <div class="step">2. Go to "My Attendance" section</div>
              <div class="step">3. Tap "Scan QR Code"</div>
              <div class="step">4. Point camera at this QR code</div>
              <div class="step">5. You'll be automatically checked in!</div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-code-container canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${qrData?.gym}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div>
      {/* Header Alert */}
      <Alert
        message="QR Code for Member Check-ins"
        description="Display this QR code at your gym entrance for members to scan and check-in automatically. Working hours: 6 AM - 10 PM"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24, borderRadius: '12px' }}
      />

      <Row gutter={[16, 16]}>
        {/* QR Code Card */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrcodeOutlined style={{ color: 'var(--primary-color)' }} />
                <span>Gym Check-in QR Code</span>
              </div>
            }
            extra={
              <Space wrap>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={generateQR}
                  loading={loading}
                  style={{ borderRadius: '8px' }}
                  size="small"
                >
                  Refresh
                </Button>
                <Button 
                  type="primary"
                  icon={<PrinterOutlined />} 
                  onClick={handlePrint}
                  disabled={!qrData}
                  style={{ borderRadius: '8px' }}
                  size="small"
                >
                  Print
                </Button>
              </Space>
            }
            loading={loading}
            style={{ textAlign: 'center', minHeight: '500px' }}
          >
            {qrData && (
              <div>
                <Title level={2} style={{ color: 'var(--primary-color)', marginBottom: 32 }}>
                  {qrData.gym}
                </Title>
                
                <div id="qr-code-container" style={{ marginBottom: 32 }}>
                  <QRCode 
                    value={JSON.stringify(qrData.qrData)} 
                    size={window.innerWidth < 768 ? 200 : 280}
                    style={{ 
                      padding: '20px',
                      background: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
                
                <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    style={{ borderRadius: '8px' }}
                  >
                    Download QR
                  </Button>
                  <Button 
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    style={{ borderRadius: '8px' }}
                  >
                    Print QR Code
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </Col>

        {/* Instructions Card */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MobileOutlined style={{ color: 'var(--primary-color)' }} />
                <span>How It Works</span>
              </div>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* For Members */}
              <div>
                <Title level={4} style={{ color: 'var(--success-color)', marginBottom: 16 }}>
                  📱 For Members:
                </Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: 'var(--primary-color)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}>1</div>
                    <Text>Open your gym mobile app</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: 'var(--primary-color)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}>2</div>
                    <Text>Go to "My Attendance" section</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: 'var(--primary-color)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}>3</div>
                    <Text>Tap "Scan QR Code" button</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: 'var(--primary-color)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}>4</div>
                    <Text>Point camera at this QR code</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircleOutlined style={{ color: 'var(--success-color)', fontSize: '20px' }} />
                    <Text strong style={{ color: 'var(--success-color)' }}>Automatically checked in!</Text>
                  </div>
                </Space>
              </div>

              <Divider />

              {/* For Gym Staff */}
              <div>
                <Title level={4} style={{ color: 'var(--warning-color)', marginBottom: 16 }}>
                  🏋️ For Gym Staff:
                </Title>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text>• Display this QR code at the gym entrance</Text>
                  <Text>• Print and laminate for durability</Text>
                  <Text>• Members can scan during working hours (6 AM - 10 PM)</Text>
                  <Text>• Monitor check-ins in the Attendance section</Text>
                </Space>
              </div>

              <div style={{ 
                background: 'var(--bg-tertiary)', 
                padding: '16px', 
                borderRadius: 'var(--radius-lg)',
                marginTop: '16px'
              }}>
                <Text strong style={{ color: 'var(--primary-color)' }}>💡 Pro Tip:</Text>
                <br />
                <Text style={{ fontSize: '14px' }}>
                  Place the QR code at eye level near the entrance for easy scanning. 
                  You can also use manual check-in for members without smartphones.
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GymQR;