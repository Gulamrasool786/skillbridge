import mongoose from "mongoose";
import FreelancerProfile from "../models/FreelancerProfile.js";

function serializeTalent(profile) {
  const name = profile.owner.name;

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();

  return {
    id: profile._id.toString(),
    name,
    initials,
    title: profile.title,
    description: profile.description,
    category: profile.category,
    skills: profile.skills,
    startingPrice: profile.startingPrice,
    deliveryDays: profile.deliveryDays,
  };
}

const ownerSelection = {
  path: "owner",
  select: "name",
  match: { role: "freelancer" },
};

export async function getTalent(req, res, next) {
  try {
    const profiles = await FreelancerProfile.find({
      status: "Published",
    })
      .populate(ownerSelection)
      .sort({ createdAt: -1, _id: -1 });

    res.status(200).json({
      success: true,
      freelancers: profiles
        .filter((profile) => profile.owner)
        .map(serializeTalent),
    });
  } catch (error) {
    next(error);
  }
}

export async function getTalentById(req, res, next) {
  try {
    const { freelancerId } = req.params;

    if (!mongoose.isObjectIdOrHexString(freelancerId)) {
      return res.status(404).json({
        success: false,
        message: "This profile is unavailable.",
      });
    }

    const profile = await FreelancerProfile.findOne({
      _id: freelancerId,
      status: "Published",
    }).populate(ownerSelection);

    if (!profile || !profile.owner) {
      return res.status(404).json({
        success: false,
        message: "This profile is unavailable.",
      });
    }

    res.status(200).json({
      success: true,
      freelancer: serializeTalent(profile),
    });
  } catch (error) {
    next(error);
  }
}