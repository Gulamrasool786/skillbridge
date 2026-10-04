import Project from "../models/Project.js";

function serializeProject(project) {
  return {
    id: project._id.toString(),
    title: project.title,
    description: project.description,
    category: project.category,
    budget: project.budget,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function createProject(req, res, next) {
  try {
    const { title, description, category, budget } = req.body ?? {};

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof category !== "string" ||
      typeof budget !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide title, description, category, and a numeric budget.",
      });
    }

    const project = await Project.create({
      title,
      description,
      category,
      budget,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      project: serializeProject(project),
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req, res, next) {
  try {
    const projects = await Project.find({
      owner: req.user._id,
    }).sort({
      createdAt: -1,
      _id: -1,
    });

    return res.status(200).json({
      success: true,
      projects: projects.map(serializeProject),
    });
  } catch (error) {
    next(error);
  }
}