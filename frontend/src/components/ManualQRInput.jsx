import React, { useState } from 'react';
import { Modal, Input, Button, Space, Typography, Alert } from 'antd';
import { EditOutlined, QrcodeOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const ManualQRInput = ({ visible, onClose, onSubmit, loading }) => {
  const [qrInput, setQrInput] = useState('');

  const handleSubmit = () => {
    if (qrInput.trim()) {
      onSubmit(qrInput.trim());
      setQrInput('');
    }
  };

  const handleClose = () => {
    setQrInput('');
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditOutlined />
          <span>Enter QR Code</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit} 
          loading={loading}
          disabled={!qrInput.trim()}
        >
          Check In
        </Button>
      ]}
      width="95%"
      style={{ maxWidth: 400 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ textAlign: 'center' }}>
          <QrcodeOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Paragraph type="secondary" style={{ margin: 0 }}>
            If you can't scan the QR code, you can manually enter the code displayed below it.
          </Paragraph>
        </div>

        <Alert
          message="How to find the code"
          description="Look for a text code below the QR code at the gym entrance, or ask gym staff for assistance."
          type="info"
          showIcon
        />

        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            Enter QR Code Data:
          </Text>
          <TextArea
            placeholder="Paste or type the QR code data here..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            rows={4}
            style={{ marginBottom: 8 }}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            The code should look like: {"{"}"gymId":"...", "timestamp":"..."{"}"} or similar
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

export default ManualQRInput;