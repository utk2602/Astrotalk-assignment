const Message = require('../models/Message');
const { generateAIResponse } = require('../utils/openai');

// @desc    Send prompt to AI and get reply
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    const { prompt, context = '' } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(prompt, context);

    // Save the conversation to database
    const message = new Message({
      sender: req.user._id,
      receiver: req.user._id, // AI conversations are self-referenced
      content: aiResponse,
      messageType: 'ai',
      isAIChat: true,
      aiPrompt: prompt,
      aiResponse: aiResponse
    });

    await message.save();

    // Populate sender details
    await message.populate('sender', 'name avatar');

    res.json({
      success: true,
      message: 'AI response generated successfully',
      data: {
        message,
        aiResponse
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI response',
      error: error.message
    });
  }
};

// @desc    Get AI chat history
// @route   GET /api/ai/history
// @access  Private
const getAIChatHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.getAIChatHistory(
      req.user._id,
      startDate,
      endDate
    );

    const total = await Message.countDocuments({
      sender: req.user._id,
      isAIChat: true,
      ...(startDate && endDate && {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    });

    res.json({
      success: true,
      data: {
        messages: messages.slice(skip, skip + parseInt(limit)),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalMessages: total,
          hasNextPage: skip + parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI chat history',
      error: error.message
    });
  }
};

// @desc    Export AI chat history
// @route   GET /api/ai/export
// @access  Private
const exportAIChatHistory = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const messages = await Message.getAIChatHistory(
      req.user._id,
      startDate,
      endDate
    );

    const exportData = {
      userId: req.user._id,
      userName: req.user.name,
      exportDate: new Date().toISOString(),
      dateRange: {
        startDate,
        endDate
      },
      totalConversations: messages.length,
      conversations: messages.map(msg => ({
        timestamp: msg.createdAt,
        prompt: msg.aiPrompt,
        response: msg.aiResponse
      }))
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Timestamp,Prompt,Response\n';
      const csvRows = exportData.conversations.map(conv => 
        `"${conv.timestamp}","${conv.prompt.replace(/"/g, '""')}","${conv.response.replace(/"/g, '""')}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ai-chat-history-${startDate}-to-${endDate}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    console.error('Export AI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting AI chat history',
      error: error.message
    });
  }
};

// @desc    Get AI chat statistics
// @route   GET /api/ai/stats
// @access  Private
const getAIChatStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      sender: req.user._id,
      isAIChat: true
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Message.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          averagePromptLength: { $avg: { $strLenCP: '$aiPrompt' } },
          averageResponseLength: { $avg: { $strLenCP: '$aiResponse' } },
          totalPromptTokens: { $sum: { $strLenCP: '$aiPrompt' } },
          totalResponseTokens: { $sum: { $strLenCP: '$aiResponse' } }
        }
      }
    ]);

    const dailyStats = await Message.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          conversations: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalConversations: 0,
          averagePromptLength: 0,
          averageResponseLength: 0,
          totalPromptTokens: 0,
          totalResponseTokens: 0
        },
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get AI stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI chat statistics',
      error: error.message
    });
  }
};

// @desc    Delete AI chat history
// @route   DELETE /api/ai/history
// @access  Private
const deleteAIChatHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const query = {
      sender: req.user._id,
      isAIChat: true
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const result = await Message.deleteMany(query);

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} AI chat messages`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Delete AI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting AI chat history',
      error: error.message
    });
  }
};

module.exports = {
  chatWithAI,
  getAIChatHistory,
  exportAIChatHistory,
  getAIChatStats,
  deleteAIChatHistory
}; 