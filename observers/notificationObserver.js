// observers/notificationObserver.js

const eventBus     = require('./eventBus');
const topicModel   = require('../models/topic')();
const postModel    = require('../models/post')();
const Notification = require('../models/notification');

// Clear any old listeners so each event fires only once
eventBus.removeAllListeners('topic:updated');
eventBus.removeAllListeners('post:commented');


/**
 * 🔔 Notify subscribers when a new post is created in a topic
 */
eventBus.on('topic:updated', async ({ topicId, postTitle, author, authorId }) => {
  try {
    if (!author || !authorId) return;

    const topic = await topicModel.getById(topicId);
    if (!topic || !Array.isArray(topic.subscribers)) return;

    const message = `${author} posted “${postTitle}” in topic #${topic.name}`;

    const receivers = topic.subscribers
      .map(sub => sub._id.toString())
      .filter(id => id !== authorId);

    await Promise.all(
      receivers.map(userId =>
        Notification.create({ user: userId, topic: topicId, message })
      )
    );
  } catch (err) {
    console.error('❌ topic:updated handler error:', err);
  }
});


/**
 * 💬 Notify on new comments:
 *   — post author: “Alice commented on your post “My Post””
 *   — other subscribers: “A post in #TopicName has a new comment”
 */
eventBus.on('post:commented', async ({
  postId,
  commentContent,
  commenterName,
  commenterId
}) => {
  try {
    if (!commenterName || !commenterId) return;

    // Use the correct loader method from your Post model
    const post = await postModel.getPostById(postId);
    if (!post || !post.author || !post.topic) return;

    const authorId  = post.author._id.toString();
    const topicId   = post.topic._id.toString();
    const postTitle = post.title;
    const topicName = post.topic.name;

    const topic = await topicModel.getById(topicId);
    if (!topic || !Array.isArray(topic.subscribers)) return;

    const receivers = topic.subscribers
      .map(sub => sub._id.toString())
      .filter(id => id !== commenterId);

    await Promise.all(receivers.map(userId => {
      const message = (userId === authorId)
        ? `${commenterName} commented on your post “${postTitle}”`
        : `A post in #${topicName} has a new comment`;
      return Notification.create({ user: userId, topic: topicId, message });
    }));
  } catch (err) {
    console.error('❌ post:commented handler error:', err);
  }
});
