import Gym from '../models/Gym.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const fixGymQRPaths = async () => {
  try {
    console.log('Starting QR path migration...');
    
    const gyms = await Gym.find({
      'payment_settings.qr_code_image': { $regex: /temp_/ }
    });
    
    console.log(`Found ${gyms.length} gyms with temp QR paths`);
    
    for (const gym of gyms) {
      const oldPath = gym.payment_settings.qr_code_image;
      
      if (oldPath && oldPath.includes('temp_')) {
        // Create proper gym directory
        const gymDir = path.join(__dirname, '../../uploads/gyms', gym._id.toString());
        if (!fs.existsSync(gymDir)) {
          fs.mkdirSync(gymDir, { recursive: true });
        }
        
        // Check if old file exists
        const oldFilePath = path.join(__dirname, '../..', oldPath);
        const newFileName = 'payment_qr.jpg';
        const newFilePath = path.join(gymDir, newFileName);
        
        if (fs.existsSync(oldFilePath)) {
          // Copy file to new location
          fs.copyFileSync(oldFilePath, newFilePath);
          console.log(`Moved QR for gym ${gym.gym_name}: ${oldPath} -> /uploads/gyms/${gym._id}/${newFileName}`);
        }
        
        // Update gym record
        gym.payment_settings.qr_code_image = `/uploads/gyms/${gym._id}/${newFileName}`;
        await gym.save();
        
        console.log(`Updated QR path for gym: ${gym.gym_name}`);
      }
    }
    
    console.log('QR path migration completed');
  } catch (error) {
    console.error('QR path migration failed:', error);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixGymQRPaths();
}