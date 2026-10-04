import FreelancerProfile, {
  PROFILE_CATEGORIES,
} from "../models/FreelancerProfile.js";

function serializeProfile(profile) {
  return {
    id: profile._id.toString(),
    title: profile.title,
    description: profile.description,
    category: profile.category,
    skills: profile.skills,
    startingPrice: profile.startingPrice,
    deliveryDays: profile.deliveryDays,
    status: profile.status,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function getMyProfile(req, res, next) {
  try {
    const profile = await FreelancerProfile.findOne({
      owner: req.user._id,
    });

    res.status(200).json({
      success: true,
      profile: profile ? serializeProfile(profile) : null,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveMyProfile(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      skills,
      startingPrice,
      deliveryDays,
    } = req.body ?? {};

    const errors = {};

    if (
      typeof title !== "string" ||
      title.trim().length < 5 ||
      title.trim().length > 100
    ) {
      errors.title = "Enter a headline between 5 and 100 characters.";
    }

    if (
      typeof description !== "string" ||
      description.trim().length < 30 ||
      description.trim().length > 2000
    ) {
      errors.description = "Enter a bio between 30 and 2000 characters.";
    }

    if (!PROFILE_CATEGORIES.includes(category)) {
      errors.category = "Choose a valid category.";
    }

    let cleanSkills = [];

    if (
      !Array.isArray(skills) ||
      skills.length < 1 ||
      skills.length > 10 ||
      skills.some(
        (skill) =>
          typeof skill !== "string" ||
          skill.trim().length < 1 ||
          skill.trim().length > 40
      )
    ) {
      errors.skills = "Add 1–10 skills, each between 1 and 40 characters.";
    } else {
      const seen = new Set();

      cleanSkills = skills
        .map((skill) => skill.trim())
        .filter((skill) => {
          const key = skill.toLowerCase();

          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        });
    }

    if (
      !Number.isInteger(startingPrice) ||
      startingPrice < 1 ||
      startingPrice > 1000000
    ) {
      errors.startingPrice = "Enter a whole-dollar price from 1 to 1,000,000.";
    }

    if (
      !Number.isInteger(deliveryDays) ||
      deliveryDays < 1 ||
      deliveryDays > 365
    ) {
      errors.deliveryDays = "Enter a whole number from 1 to 365.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please correct the profile details.",
        errors,
      });
    }

    const profile = await FreelancerProfile.findOneAndUpdate(
      { owner: req.user._id },
      {
        $set: {
          title: title.trim(),
          description: description.trim(),
          category,
          skills: cleanSkills,
          startingPrice,
          deliveryDays,
        },
        $setOnInsert: {
          status: "Draft",
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      profile: serializeProfile(profile),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another profile save completed first. Please retry.",
      });
    }

    next(error);
  }
}

export async function updateMyProfileStatus(req, res, next) {
  try {
    const { status } = req.body ?? {};

    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Choose Draft or Published.",
      });
    }

    const profile = await FreelancerProfile.findOne({
      owner: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Save your profile before publishing it.",
      });
    }

    profile.status = status;
    await profile.save();

    res.status(200).json({
      success: true,
      profile: serializeProfile(profile),
    });
  } catch (error) {
    next(error);
  }
}