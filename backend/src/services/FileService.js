import fs from 'fs';
import path from 'path';

class FileService {
  constructor(storageType = 'local') {
    this.storageType = storageType;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  }

  async uploadFile(file, gymName, category) {
    if (this.storageType === 'local') {
      return this.uploadToLocal(file, gymName, category);
    }
    throw new Error(`Storage type ${this.storageType} not implemented`);
  }

  async deleteFile(filePath) {
    if (this.storageType === 'local') {
      return this.deleteFromLocal(filePath);
    }
    throw new Error(`Storage type ${this.storageType} not implemented`);
  }

  uploadToLocal(file, gymName, category) {
    const sanitizedGymName = gymName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const uploadDir = path.join(process.cwd(), 'uploads', 'gyms', sanitizedGymName);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const fileName = category === 'logo' ? `logo${ext}` : 
                    category === 'banners' ? `banner_${Date.now()}${ext}` :
                    `gallery_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    
    return `${this.baseUrl}/uploads/gyms/${sanitizedGymName}/${fileName}`;
  }

  deleteFromLocal(fileUrl) {
    try {
      const relativePath = fileUrl.replace(this.baseUrl, '');
      const fullPath = path.join(process.cwd(), relativePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export default new FileService();