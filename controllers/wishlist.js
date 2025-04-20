const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getWishlist(request, response) {
  try {
    const { userId } = request.query;

    if (!userId) {
      return response.status(400).json({ error: "User ID is required" });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true }
            },
            category: true
          }
        }
      }
    });

    return response.status(200).json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return response.status(500).json({ error: "Failed to fetch wishlist" });
  }
}

async function addToWishlist(request, response) {
  try {
    const { userId, productId } = request.body;

    if (!userId || !productId) {
      return response.status(400).json({ error: "User ID and Product ID are required" });
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingItem) {
      return response.status(400).json({ error: "Item already in wishlist" });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId
      },
      include: {
        product: true
      }
    });

    return response.status(201).json(wishlistItem);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return response.status(500).json({ error: "Failed to add item to wishlist" });
  }
}

async function removeFromWishlist(request, response) {
  try {
    const { wishlistId } = request.params;

    if (!wishlistId) {
      return response.status(400).json({ error: "Wishlist item ID is required" });
    }

    await prisma.wishlist.delete({
      where: { id: wishlistId }
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return response.status(500).json({ error: "Failed to remove item from wishlist" });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};