import { useState } from 'react';
import { Upload, Button, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { uploadGymFiles, deleteGymFile } from '../services/fileService';

const FileUpload = ({ 
  gymId, 
  category, 
  fileList, 
  setFileList, 
  maxCount = 1, 
  gymName,
  onUploadSuccess 
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (info) => {
    const { fileList: newFileList } = info;
    
    // Filter out files that are already uploaded
    const filesToUpload = newFileList.filter(file => 
      file.status !== 'done' && file.originFileObj
    );

    if (filesToUpload.length === 0) {
      setFileList(newFileList);
      return;
    }

    setUploading(true);
    
    try {
      const result = await uploadGymFiles(gymId, filesToUpload, category, gymName);
      
      // Update file list with uploaded URLs
      const updatedFileList = [...fileList.filter(f => f.status === 'done')];
      
      result.files.forEach((url, index) => {
        updatedFileList.push({
          uid: `new-${Date.now()}-${index}`,
          name: url.split('/').pop(),
          status: 'done',
          url,
          thumbUrl: url,
          response: { url }
        });
      });

      setFileList(updatedFileList);
      onUploadSuccess?.(result);
      message.success('Files uploaded successfully');
    } catch (error) {
      message.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (file) => {
    if (file.url || file.response?.url) {
      try {
        await deleteGymFile(gymId, file.url || file.response.url, category);
        message.success('File deleted successfully');
        onUploadSuccess?.();
      } catch (error) {
        message.error('Delete failed: ' + error.message);
        return false;
      }
    }
    
    setFileList(prev => prev.filter(item => item.uid !== file.uid));
    return true;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      onChange={handleUpload}
      onRemove={handleRemove}
      onPreview={(file) => {
        const src = file.url || file.preview;
        if (src) {
          const image = new Image();
          image.src = src;
          const imgWindow = window.open(src);
          imgWindow?.document.write(image.outerHTML);
        }
      }}
      beforeUpload={() => false}
      multiple={maxCount > 1}
      disabled={uploading}
      showUploadList={{
        showPreviewIcon: true,
        showRemoveIcon: true,
        showDownloadIcon: false
      }}
    >
      {fileList.length >= maxCount ? null : uploadButton}
    </Upload>
  );
};

export default FileUpload;