import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const loginActivitySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    successful: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model('LoginActivity', loginActivitySchema);
