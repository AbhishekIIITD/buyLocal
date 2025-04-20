const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getDeliveryZones(request, response) {
  try {
    const { postalCode } = request.query;

    if (postalCode) {
      // Check if postal code is serviceable
      const deliveryZone = await prisma.deliveryZone.findFirst({
        where: {
          postalCodes: {
            contains: postalCode
          },
          isActive: true
        }
      });

      if (deliveryZone) {
        return response.status(200).json({
          isServiceable: true,
          zone: deliveryZone
        });
      } else {
        return response.status(200).json({
          isServiceable: false,
          message: "This area is not currently serviceable"
        });
      }
    } else {
      // Get all delivery zones
      const deliveryZones = await prisma.deliveryZone.findMany({
        where: { isActive: true }
      });
      return response.status(200).json(deliveryZones);
    }
  } catch (error) {
    console.error("Error fetching delivery zones:", error);
    return response.status(500).json({ error: "Failed to fetch delivery zones" });
  }
}

async function createDeliveryZone(request, response) {
  try {
    const { name, postalCodes, minOrderAmount, deliveryFee, isActive } = request.body;

    if (!name || !postalCodes) {
      return response.status(400).json({ error: "Name and postal codes are required" });
    }

    const deliveryZone = await prisma.deliveryZone.create({
      data: {
        name,
        postalCodes,
        minOrderAmount,
        deliveryFee,
        isActive
      }
    });

    return response.status(201).json(deliveryZone);
  } catch (error) {
    console.error("Error creating delivery zone:", error);
    return response.status(500).json({ error: "Failed to create delivery zone" });
  }
}

async function updateDeliveryZone(request, response) {
  try {
    const { id } = request.params;
    const updateData = request.body;

    if (!id) {
      return response.status(400).json({ error: "Delivery zone ID is required" });
    }

    const deliveryZone = await prisma.deliveryZone.update({
      where: { id },
      data: updateData
    });

    return response.status(200).json(deliveryZone);
  } catch (error) {
    console.error("Error updating delivery zone:", error);
    return response.status(500).json({ error: "Failed to update delivery zone" });
  }
}

async function deleteDeliveryZone(request, response) {
  try {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({ error: "Delivery zone ID is required" });
    }

    await prisma.deliveryZone.delete({
      where: { id }
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting delivery zone:", error);
    return response.status(500).json({ error: "Failed to delete delivery zone" });
  }
}

module.exports = {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone
};