import Gym from '../models/Gym.js';
import FileService from '../services/FileService.js';

export const uploadGymFiles = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { category } = req.body;
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (req.user.role !== 'admin' && gym.owner_user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    
    for (const file of req.files) {
      const fileUrl = await FileService.uploadFile(file, gym.gym_display_name || gym.gym_name, category, req);
      uploadedFiles.push(fileUrl);
    }

    // Update gym model based on category
    if (category === 'logo') {
      if (gym.gym_logo) {
        await FileService.deleteFile(gym.gym_logo);
      }
      gym.gym_logo = uploadedFiles[0];
    } else if (category === 'banners') {
      gym.banner_images = [...(gym.banner_images || []), ...uploadedFiles];
    } else if (category === 'gallery') {
      gym.gallery_images = [...(gym.gallery_images || []), ...uploadedFiles];
    }

    await gym.save();

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      gym: {
        gym_logo: gym.gym_logo,
        banner_images: gym.banner_images,
        gallery_images: gym.gallery_images
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const deleteGymFile = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { fileUrl, category } = req.body;
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (req.user.role !== 'admin' && gym.owner_user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await FileService.deleteFile(fileUrl);

    if (category === 'logo') {
      gym.gym_logo = null;
    } else if (category === 'banners') {
      gym.banner_images = gym.banner_images.filter(img => img !== fileUrl);
    } else if (category === 'gallery') {
      gym.gallery_images = gym.gallery_images.filter(img => img !== fileUrl);
    }

    await gym.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};