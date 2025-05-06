// controllers/commentController.js

const Comment  = require('../models/comment');
const Post     = require('../models/post').model;
const Topic    = require('../models/topic');
const eventBus = require('../observers/eventBus');

exports.createComment = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { content, postId } = req.body;

  try {
    // 1) Load the post (with its topic)
    const post = await Post.findById(postId).populate('topic');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 2) Check subscription
    const topic = post.topic;
    const isSubscribed = topic.subscribers.includes(req.session.user._id);
    if (!isSubscribed) {
      return res.status(403).json({ error: 'Not subscribed to this topic' });
    }

    // 3) Create & save the comment
    const comment = new Comment({
      content,
      post: postId,
      user: req.session.user._id
    });
    await comment.save();
    await comment.populate('user', 'username');

    // 4) Emit the notification event
    eventBus.emit('post:commented', {
      postId,
      commentContent: comment.content,
      commenterId:    req.session.user._id.toString(),
      commenterName:  req.session.user.username
    });

    // 5) Return to client
    res.status(200).json({ message: 'Comment added', comment });
  } catch (err) {
    console.error('createComment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId })
      .populate('user', 'username')
      .sort('created');

    res.status(200).json({ comments });
  } catch (err) {
    console.error('getComments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id || req.session.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!comment.user.equals(userId)) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    await comment.deleteOne();

    if (req.accepts('json')) {
      return res.json({ success: true });
    }

    res.redirect('back');
  } catch (err) {
    console.error('deleteComment error:', err);
    if (req.accepts('json')) {
      return res.status(500).json({ error: err.message });
    }
    req.flash('error', err.message);
    res.redirect('back');
  }
};
