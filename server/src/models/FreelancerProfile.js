import mongoose from "mongoose";

export const PROFILE_CATEGORIES = [
  "Development",
  "Design",
  "Writing",
  "Marketing",
];

const freelancerProfileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      enum: PROFILE_CATEGORIES,
    },

    skills: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      validate: {
        validator: (skills) =>
          skills.length >= 1 &&
          skills.length <= 10 &&
          skills.every((skill) => skill.length > 0),
        message: "Add between 1 and 10 skills.",
      },
    },

    startingPrice: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
      validate: {
        validator: Number.isInteger,
        message: "Use a whole-dollar starting price.",
      },
    },

    deliveryDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
      validate: {
        validator: Number.isInteger,
        message: "Delivery time must be a whole number of days.",
      },
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "FreelancerProfile",
  freelancerProfileSchema
);