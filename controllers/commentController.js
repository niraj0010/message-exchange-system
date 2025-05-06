const Comment = require('../models/comment');
const Post = require('../models/post').model; 
const Topic = require('../models/topic');

exports.createComment = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  const { content, postId } = req.body;

  try {
    const post = await Post.findById(postId).populate('topic');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Optional: check if user is subscribed to this topic
    const topic = post.topic;
    const isSubscribed = topic.subscribers.includes(req.session.user._id);
    if (!isSubscribed) return res.status(403).json({ error: 'Not subscribed to this topic' });

    const comment = new Comment({
      content,
      post: postId,
      user: req.session.user._id
    });

    await comment.save();
    await comment.populate('user', 'username'); // ✅ Populate user before sending to frontend

    res.status(200).json({ message: 'Comment added', comment });
  } catch (err) {
    console.error(err);
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
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id || req.session.user?._id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (!comment.user.equals(userId)) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    await comment.deleteOne();

    if (req.accepts('json')) {
      return res.json({ success: true });
    }

    res.redirect('back');
  } catch (err) {
    if (req.accepts('json')) {
      return res.status(500).json({ error: err.message });
    }

    req.flash('error', err.message);
    res.redirect('back');
  }
};
