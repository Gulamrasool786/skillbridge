import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      immutable: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    requestId: {
      type: String,
      required: true,
      maxlength: 80,
      immutable: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, _id: -1 });

// Retrying the same send request must not create duplicate messages.
messageSchema.index(
  { conversation: 1, sender: 1, requestId: 1 },
  { unique: true }
);

export default mongoose.model("Message", messageSchema);