import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
    }, {
        timestamps: true
    }
);

const Post = mongoose.model('Bookmark', bookmarkSchema);
export default Post;
