import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Alert, Space, Typography } from 'antd';
import { CameraOutlined, CloseOutlined, ScanOutlined } from '@ant-design/icons';
import jsQR from 'jsqr';

const { Text } = Typography;

const QRScanner = ({ visible, onClose, onScan, loading }) => {
  const [error, setError] = useState('');
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningText, setScanningText] = useState('Position QR code here');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    if (visible && hasCamera) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [visible, hasCamera]);

  const startCamera = async () => {
    try {
      setError('');
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setError('Camera not supported on this device');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning after video loads
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScanning = () => {
    if (scanIntervalRef.current) return;
    
    setIsScanning(true);
    setScanningText('Scanning...');
    
    scanIntervalRef.current = setInterval(() => {
      scanQRCode();
    }, 300); // Scan every 300ms for better responsiveness
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR detection (in production, use a proper QR library like jsQR)
      try {
        // For demo purposes, we'll simulate QR detection
        // In production, integrate with jsQR or similar library
        const qrData = detectQRFromImageData(imageData);
        if (qrData) {
          onScan(qrData);
          stopCamera();
        }
      } catch (err) {
        console.error('QR scan error:', err);
      }
    }
  };

  const detectQRFromImageData = (imageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        // Provide haptic feedback on mobile
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        // Visual feedback
        setScanningText('QR Code Found! ✓');
        setIsScanning(false);
        
        return code.data;
      }
      return null;
    } catch (error) {
      console.error('QR detection error:', error);
      return null;
    }
  };

  const handleManualInput = () => {
    stopCamera();
    // Trigger manual input mode
    onScan('MANUAL_INPUT_MODE');
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ScanOutlined />
          <span>Scan QR Code</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ maxWidth: 400, top: 20 }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <div>
            <Alert
              message="Camera Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Button 
              type="primary" 
              onClick={handleManualInput}
              block
              size="large"
            >
              Enter QR Code Manually
            </Button>
          </div>
        ) : hasCamera ? (
          <div>
            <div style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '300px',
              margin: '0 auto 16px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#000'
            }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                border: `2px solid ${isScanning ? '#52c41a' : '#1890ff'}`,
                borderRadius: '12px',
                background: `rgba(${isScanning ? '82, 196, 26' : '24, 144, 255'}, 0.1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: isScanning ? 'pulse 1.5s infinite' : 'none',
                overflow: 'hidden'
              }}>
                {/* Scan line animation */}
                {isScanning && (
                  <div className="qr-scan-line" style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #1890ff, transparent)',
                    animation: 'scanLine 2s linear infinite'
                  }} />
                )}
                
                <div style={{
                  color: isScanning ? '#52c41a' : '#1890ff',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  zIndex: 1
                }}>
                  {scanningText}
                </div>
              </div>
              
              {/* Corner indicators */}
              <div style={{
                position: 'absolute',
                top: 'calc(50% - 110px)',
                left: 'calc(50% - 110px)',
                width: '20px',
                height: '20px',
                borderTop: '3px solid #1890ff',
                borderLeft: '3px solid #1890ff',
                borderRadius: '4px 0 0 0'
              }} />
              <div style={{
                position: 'absolute',
                top: 'calc(50% - 110px)',
                right: 'calc(50% - 110px)',
                width: '20px',
                height: '20px',
                borderTop: '3px solid #1890ff',
                borderRight: '3px solid #1890ff',
                borderRadius: '0 4px 0 0'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 'calc(50% - 110px)',
                left: 'calc(50% - 110px)',
                width: '20px',
                height: '20px',
                borderBottom: '3px solid #1890ff',
                borderLeft: '3px solid #1890ff',
                borderRadius: '0 0 0 4px'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 'calc(50% - 110px)',
                right: 'calc(50% - 110px)',
                width: '20px',
                height: '20px',
                borderBottom: '3px solid #1890ff',
                borderRight: '3px solid #1890ff',
                borderRadius: '0 0 4px 0'
              }} />
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: 16 }}>
              Point your camera at the gym's QR code
            </Text>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                onClick={handleManualInput}
                block
                style={{ marginBottom: 8 }}
              >
                Enter Code Manually
              </Button>
              <Button 
                icon={<CloseOutlined />}
                onClick={onClose}
                block
              >
                Cancel
              </Button>
            </Space>
          </div>
        ) : (
          <div>
            <CameraOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Camera not available
            </Text>
            <Button 
              type="primary" 
              onClick={handleManualInput}
              block
              size="large"
            >
              Enter QR Code Manually
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRScanner;