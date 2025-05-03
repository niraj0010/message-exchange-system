const express = require('express');
const router = express.Router();
const topicService = require('../models/topic')();

// Route: /api/stats/topic-access
router.get('/api/stats/topic-access', async (req, res) => {
  try {
    const topics = await topicService.getAll();
    const stats = topics.map(topic => ({
      name: topic.name,
      accessCount: topic.accessCount
    }));
    res.render('topicStats', { stats });
  } catch (err) {
    console.error('Error fetching topic stats:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
