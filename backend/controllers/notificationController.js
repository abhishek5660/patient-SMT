const Notification = require('../models/Notification');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) return res.status(404).json({ msg: 'Notification not found' });

        // Check ownership
        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Mark all notifications as read
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Function for other controllers to use to create notifications
exports.createNotification = async (userId, title, message, type = 'info') => {
    try {
        const newNotification = new Notification({
            user: userId,
            title,
            message,
            type
        });
        await newNotification.save();
        return newNotification;
    } catch (err) {
        console.error('Error creating notification:', err.message);
    }
};
