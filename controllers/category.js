const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCategory(request, response) {
  try {
    const { name } = request.body;
    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    return response.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return response.status(500).json({ error: "Error creating category" });
  }
}

async function updateCategory(request, response) {
  try {
    const { id } = request.params;
    const { name } = request.body;

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingCategory) {
      return response.status(404).json({ error: "Category not found" });
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: existingCategory.id,
      },
      data: {
        name,
      },
    });

    return response.status(200).json(updatedCategory);
  } catch (error) {
    return response.status(500).json({ error: "Error updating category" });
  }
}

async function deleteCategory(request, response) {
  try {
    const { id } = request.params;
    await prisma.category.delete({
      where: {
        id: id,
      },
    });
    return response.status(204).send();
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Error deleting category" });
  }
}

async function getCategory(request, response) {
  const { id } = request.params;
  const category = await prisma.category.findUnique({
    where: {
      id: id,
    },
  });
  if (!category) {
    return response.status(404).json({ error: "Category not found" });
  }
  return response.status(200).json(category);
}

async function getAllCategories(request, response) {
  try {
    const categories = await prisma.category.findMany({});
    return response.json(categories);
  } catch (error) {
    return response.status(500).json({ error: "Error fetching categories" });
  }
}

async function getCategoryIdByUsage(request, response) {
  try {
    //console.log("Request query:", request.query);
    const { usage } = request.query;
    
    // If no usage is provided, return an error
    if (!usage) {
      return response.status(400).json({ error: "Usage parameter is required" });
    }
    
    // Map usage to category name format in database (adding '-pc' suffix)

    const categoryName = `${usage}-pc`;
    
    // Find the category with the corresponding name
    const category = await prisma.category.findFirst({
      where: {
        name: categoryName,
      },
      select: {
        id: true,
        name: true,
      },
    });
    
    // Handle case where category doesn't exist
    if (!category) {
      return response.status(404).json({ error: `No category found for usage: ${usage}` });
    }
    
    return response.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category by usage:", error);
    return response.status(500).json({ error: "Error fetching category by usage" });
  }
}

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
  getCategoryIdByUsage,
};
