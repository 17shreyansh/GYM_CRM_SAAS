import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Switch, Space, Divider } from 'antd';
import { UploadOutlined, QrcodeOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { TextArea } = Input;

const PaymentSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [currentSettings, setCurrentSettings] = useState(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await api.get('/gym/payment-settings');
      const settings = response.data.payment_settings;
      setCurrentSettings(settings);
      form.setFieldsValue(settings);
    } catch (error) {
      console.error('Failed to fetch payment settings:', error);
    }
  };

  const handleQrUpload = async (file) => {
    try {
      const { validateImageFile, convertFileToBase64 } = await import('../utils/fileUpload');
      validateImageFile(file);
      const base64 = await convertFileToBase64(file);
      setQrCodeFile(base64);
      message.success('QR code uploaded successfully');
    } catch (error) {
      message.error(error.message || 'Failed to upload QR code');
    }
    return false; // Prevent auto upload
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        qr_code_image: qrCodeFile || currentSettings?.qr_code_image
      };

      await api.post('/gym/payment-settings', payload);
      message.success('Payment settings updated successfully');
      fetchPaymentSettings();
    } catch (error) {
      message.error('Failed to update payment settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <QrcodeOutlined />
            Payment Settings
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            manual_approval: true,
            payment_instructions: 'Please scan the QR code to make payment and upload the payment screenshot for verification.'
          }}
        >
          <Form.Item
            label="UPI ID"
            name="upi_id"
            rules={[{ required: true, message: 'Please enter your UPI ID' }]}
          >
            <Input placeholder="your-upi-id@paytm" />
          </Form.Item>

          <Form.Item
            label="QR Code Image"
            name="qr_code_image"
          >
            <Upload
              beforeUpload={handleQrUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>
                Upload QR Code
              </Button>
            </Upload>
            {(qrCodeFile || currentSettings?.qr_code_image) && (
              <div style={{ marginTop: 16 }}>
                <img 
                  src={qrCodeFile || currentSettings?.qr_code_image} 
                  alt="QR Code" 
                  style={{ maxWidth: 200, maxHeight: 200, border: '1px solid #d9d9d9', borderRadius: 4 }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="Payment Instructions"
            name="payment_instructions"
          >
            <TextArea 
              rows={4} 
              placeholder="Enter instructions for members on how to make payment..."
            />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Manual Approval"
            name="manual_approval"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="ON" 
              unCheckedChildren="OFF"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PaymentSettings;