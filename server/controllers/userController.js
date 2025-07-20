const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, about, specializations, experience, hourlyRate } = req.body;
    const updateFields = {};

    // Only allow updating specific fields
    if (name) updateFields.name = name;
    if (about !== undefined) updateFields.about = about;
    if (specializations) updateFields.specializations = specializations;
    if (experience !== undefined) updateFields.experience = experience;
    if (hourlyRate !== undefined) updateFields.hourlyRate = hourlyRate;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Assuming cloudinary upload is handled in middleware
    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar',
      error: error.message
    });
  }
};

// @desc    Get list of astrologers
// @route   GET /api/users/astrologers
// @access  Public
const getAstrologers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      specialization, 
      minRating, 
      maxPrice,
      isOnline,
      isVerified 
    } = req.query;

    const query = { role: 'astrologer' };

    // Apply filters
    if (specialization) {
      query.specializations = { $in: [specialization] };
    }
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    if (maxPrice) {
      query.hourlyRate = { $lte: parseFloat(maxPrice) };
    }
    if (isOnline !== undefined) {
      query.isOnline = isOnline === 'true';
    }
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const astrologers = await User.find(query)
      .select('-password')
      .sort({ rating: -1, isOnline: -1, isVerified: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        astrologers: astrologers.map(user => user.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAstrologers: total,
          hasNextPage: skip + astrologers.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get astrologers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching astrologers',
      error: error.message
    });
  }
};

// @desc    Update user online status
// @route   PATCH /api/users/status/:id
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    // Users can only update their own status
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own status'
      });
    }

    const updateFields = { isOnline };
    if (!isOnline) {
      updateFields.lastSeen = new Date();
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments({ role: 'user' }),
      totalAstrologers: await User.countDocuments({ role: 'astrologer' }),
      onlineAstrologers: await User.countDocuments({ 
        role: 'astrologer', 
        isOnline: true 
      }),
      verifiedAstrologers: await User.countDocuments({ 
        role: 'astrologer', 
        isVerified: true 
      })
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

module.exports = {
  getUserById,
  updateProfile,
  updateAvatar,
  getAstrologers,
  updateStatus,
  getUserStats
}; 