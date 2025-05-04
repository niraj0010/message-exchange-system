// observers/notificationObserver.js

const eventBus     = require('./eventBus');
const topicModel   = require('../models/topic')();
const Notification = require('../models/notification');

// Remove any previously attached handlers so we fire only once
eventBus.removeAllListeners('topic:updated');

eventBus.on('topic:updated', async ({ topicId, postTitle, author, authorId }) => {
  try {
    // 0) Skip any incomplete emissions
    if (!author || !authorId) {
      console.warn('📛 Skipping incomplete topic:updated event', { topicId, postTitle, author, authorId });
      return;
    }

    // 1) Debug log the valid event
    console.log('📣 topic:updated', { topicId, postTitle, author, authorId });

    // 2) Load the topic (with subscribers)
    const topic = await topicModel.getById(topicId);
    if (!topic || !Array.isArray(topic.subscribers)) {
      console.warn('⚠️  No subscribers for topic', topicId);
      return;
    }

    // 3) Build the notification message
    const message = `${author} posted “${postTitle}” in topic #${topic.name}`;

    // 4) Extract subscriber IDs and filter out the poster
    const receivers = topic.subscribers
      .map(sub => sub._id.toString())
      .filter(id => id !== authorId);

    console.log('➡️  Notifying:', receivers);

    // 5) Create notifications for each of the other subscribers
    await Promise.all(
      receivers.map(userId =>
        Notification.create({ user: userId, topic: topicId, message })
      )
    );
  } catch (err) {
    console.error(' notificationObserver error:', err);
  }
});
