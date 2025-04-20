const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getUserAddresses(request, response) {
  try {
    const { userId } = request.query;

    if (!userId) {
      return response.status(400).json({ error: "User ID is required" });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    return response.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return response.status(500).json({ error: "Failed to fetch addresses" });
  }
}

async function createAddress(request, response) {
  try {
    const {
      userId,
      street,
      apartment,
      city,
      state,
      postalCode,
      addressType,
      isDefault,
      latitude,
      longitude
    } = request.body;

    if (!userId || !street || !city || !state || !postalCode) {
      return response.status(400).json({ error: "Required fields are missing" });
    }

    // If this is set as default, update other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        street,
        apartment,
        city,
        state,
        postalCode,
        addressType,
        isDefault,
        latitude,
        longitude
      }
    });

    return response.status(201).json(address);
  } catch (error) {
    console.error("Error creating address:", error);
    return response.status(500).json({ error: "Failed to create address" });
  }
}

async function updateAddress(request, response) {
  try {
    const { id } = request.params;
    const updateData = request.body;

    if (!id) {
      return response.status(400).json({ error: "Address ID is required" });
    }

    // If updating to default, update other addresses
    if (updateData.isDefault) {
      const existingAddress = await prisma.address.findUnique({
        where: { id }
      });

      if (existingAddress) {
        await prisma.address.updateMany({
          where: {
            userId: existingAddress.userId,
            isDefault: true,
            NOT: { id }
          },
          data: { isDefault: false }
        });
      }
    }

    const address = await prisma.address.update({
      where: { id },
      data: updateData
    });

    return response.status(200).json(address);
  } catch (error) {
    console.error("Error updating address:", error);
    return response.status(500).json({ error: "Failed to update address" });
  }
}

async function deleteAddress(request, response) {
  try {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({ error: "Address ID is required" });
    }

    await prisma.address.delete({
      where: { id }
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting address:", error);
    return response.status(500).json({ error: "Failed to delete address" });
  }
}

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};