import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true,
      immutable:true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 20,
      maxLength: 2000,
    },

    category: {
      type: String,
      required: true,
      enum: ["Development", "Design", "Writing", "Marketing"],
    },

    budget: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
      validate: {
        validator: Number.isInteger,
        message: "Budget must be a whole-dollar amount.",
      },
    },

    status: {
      type: String,
      enum: ["Draft"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);
projectSchema.index({
  owner: 1,
  createdAt: -1,
  _id: -1,
});
const Project = mongoose.model("Project", projectSchema);

export default Project;