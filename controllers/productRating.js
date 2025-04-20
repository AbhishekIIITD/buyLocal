const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getProductRatings(request, response) {
  try {
    const { productId } = request.params;

    if (!productId) {
      return response.status(400).json({ error: "Product ID is required" });
    }

    const ratings = await prisma.productRating.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : 0;

    return response.status(200).json({
      ratings,
      averageRating,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error("Error fetching product ratings:", error);
    return response.status(500).json({ error: "Failed to fetch product ratings" });
  }
}

async function createProductRating(request, response) {
  try {
    const { productId, userId, rating, review } = request.body;

    if (!productId || !userId || !rating) {
      return response.status(400).json({ error: "Product ID, User ID, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return response.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const productRating = await prisma.productRating.create({
      data: {
        productId,
        userId,
        rating,
        review
      }
    });

    return response.status(201).json(productRating);
  } catch (error) {
    console.error("Error creating product rating:", error);
    return response.status(500).json({ error: "Failed to create product rating" });
  }
}

async function updateProductRating(request, response) {
  try {
    const { id } = request.params;
    const { rating, review } = request.body;

    if (!id) {
      return response.status(400).json({ error: "Rating ID is required" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return response.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const updatedRating = await prisma.productRating.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(review !== undefined && { review })
      }
    });

    return response.status(200).json(updatedRating);
  } catch (error) {
    console.error("Error updating product rating:", error);
    return response.status(500).json({ error: "Failed to update product rating" });
  }
}

async function deleteProductRating(request, response) {
  try {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({ error: "Rating ID is required" });
    }

    await prisma.productRating.delete({
      where: { id }
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting product rating:", error);
    return response.status(500).json({ error: "Failed to delete product rating" });
  }
}

module.exports = {
  getProductRatings,
  createProductRating,
  updateProductRating,
  deleteProductRating
};