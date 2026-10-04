import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    clientLastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    freelancerLastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index(
  { client: 1, freelancer: 1 },
  { unique: true }
);

conversationSchema.index({
  freelancer: 1,
  createdAt: -1,
});

export default mongoose.model(
  "Conversation",
  conversationSchema
);