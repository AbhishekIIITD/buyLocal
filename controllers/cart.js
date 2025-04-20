const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getCart(request, response) {
  try {
    const { userId } = request.query;

    if (!userId) {
      return response.status(400).json({ error: "User ID is required" });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true }
            }
          }
        }
      }
    });

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    return response.status(200).json({
      items: cartItems,
      total
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return response.status(500).json({ error: "Failed to fetch cart" });
  }
}

async function addToCart(request, response) {
  try {
    const { userId, productId, quantity = 1 } = request.body;

    if (!userId || !productId) {
      return response.status(400).json({ error: "User ID and Product ID are required" });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        },
        include: {
          product: true
        }
      });
      return response.status(200).json(updatedItem);
    } else {
      // Create new cart item
      const newItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        },
        include: {
          product: true
        }
      });
      return response.status(201).json(newItem);
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return response.status(500).json({ error: "Failed to add item to cart" });
  }
}

async function updateCartItem(request, response) {
  try {
    const { cartItemId, quantity } = request.body;

    if (!cartItemId || quantity === undefined) {
      return response.status(400).json({ error: "Cart item ID and quantity are required" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
      return response.status(200).json({ message: "Item removed from cart" });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: true
      }
    });

    return response.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return response.status(500).json({ error: "Failed to update cart item" });
  }
}

async function removeFromCart(request, response) {
  try {
    const { cartItemId } = request.params;

    if (!cartItemId) {
      return response.status(400).json({ error: "Cart item ID is required" });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error removing from cart:", error);
    return response.status(500).json({ error: "Failed to remove item from cart" });
  }
}

async function clearCart(request, response) {
  try {
    const { userId } = request.body;

    if (!userId) {
      return response.status(400).json({ error: "User ID is required" });
    }

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error clearing cart:", error);
    return response.status(500).json({ error: "Failed to clear cart" });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};