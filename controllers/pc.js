const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new PC configuration
async function createPC(req, res) {
  try {
    const {
      usage,
      processorId,
      motherBoardId,
      ramId,
      graphicCardId,
      primaryStorageId,
      secondaryStorageId,
      caseId,
      coolerId,
      powerSupplyId,
      operatingSystemId,
      productId,
    } = req.body;

    const pc = await prisma.pc.create({
      data: {
        usage,
        processorId,
        motherBoardId,
        ramId,
        graphicCardId,
        primaryStorageId,
        secondaryStorageId,
        caseId,
        coolerId,
        powerSupplyId,
        operatingSystemId,
        productId,
      },
    });

    return res.status(201).json(pc);
  } catch (error) {
    console.error("Error creating PC:", error);
    return res.status(500).json({ error: "Error creating PC" });
  }
}

// Get all PC configurations
async function getAllPCs(request, response) {
  try {
    // Get usage from query parameters
    const usage = request.query.usage;
    
    // Get page number, default to 1 if not provided
    const page = Number(request.query.page) || 1;
    // console.log(usage);

    // Prepare query options
    const queryOptions = {
      skip: (page - 1) * 10,
      take: 12,
      include: {
        processor: true,
        motherBoard: true,
        ram: true,
        graphicCard: true,
        primaryStorage: true,
        secondaryStorage: true,
        pcCase: true,
        cooler: true,
        powerSupply: true,
        operatingSystem: true,
      }
    };


    // Add where clause if usage is provided
    if (usage) {
      queryOptions.where = {
        usage: usage
      };
    }

    // Fetch PCs
    const pcs = await prisma.pc.findMany(queryOptions);

    return response.json(pcs);
  } catch (error) {
    console.error("Error fetching PCs:", error);
    return response.status(500).json({ error: "Error fetching PCs" });
  }
}
// Get a single PC configuration by ID
async function getPC(req, res) {
  try {
    const { id } = req.params;
    const pc = await prisma.pc.findUnique({
      where: { id },
      include: {
        processor: true,
        motherBoard: true,
        ram: true,
        graphicCard: true,
        primaryStorage: true,
        secondaryStorage: true,
        pcCase: true,
        cooler: true,
        powerSupply: true,
        operatingSystem: true,
      },
    });

    if (!pc) {
      return res.status(404).json({ error: "PC not found" });
    }

    return res.json(pc);
  } catch (error) {
    console.error("Error fetching PC:", error);
    return res.status(500).json({ error: "Error fetching PC" });
  }
}

// Get PC configurations by usage
async function getPcByUsage(req, res) {
  try {
    const { usage } = req.params;
    
    // Validate usage input
    const validUsages =["gaming", "productivity", "content", "development", "streaming", "workstation", "budget", "mini", "student", "custom"];

    if (!validUsages.includes(usage)) {
      return res.status(400).json({ error: "Invalid usage type" });
    }
    
    const pcs = await prisma.pc.findMany({
      where: { usage },
      include: {
        processor: true,
        motherBoard: true,
        ram: true,
        graphicCard: true,
        primaryStorage: true,
        secondaryStorage: true,
        pcCase: true,
        cooler: true,
        powerSupply: true,
        operatingSystem: true,
      },
    });
    
    if (pcs.length === 0) {
      return res.status(404).json({ error: `No PCs found for usage: ${usage}` });
    }
    
    return res.json(pcs);
  } catch (error) {
    console.error(`Error fetching PCs by usage (${req.params.usage}):`, error);
    return res.status(500).json({ error: "Error fetching PCs by usage" });
  }
}

// Update a PC configuration
async function updatePC(req, res) {
  try {
    const { id } = req.params;
    const {
      usage,
      processorId,
      motherBoardId,
      ramId,
      graphicCardId,
      primaryStorageId,
      secondaryStorageId,
      caseId,
      coolerId,
      powerSupplyId,
      operatingSystemId,
    } = req.body;

    const existingPC = await prisma.pc.findUnique({ where: { id } });
    if (!existingPC) {
      return res.status(404).json({ error: "PC not found" });
    }

    const updatedPC = await prisma.pc.update({
      where: { id },
      data: {
        usage,
        processorId,
        motherBoardId,
        ramId,
        graphicCardId,
        primaryStorageId,
        secondaryStorageId,
        caseId,
        coolerId,
        powerSupplyId,
        operatingSystemId,
      },
    });

    return res.json(updatedPC);
  } catch (error) {
    console.error("Error updating PC:", error);
    return res.status(500).json({ error: "Error updating PC" });
  }
}

// Delete a PC configuration
async function deletePC(req, res) {
  try {
    const { id } = req.params;

    await prisma.pc.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting PC:", error);
    return res.status(500).json({ error: "Error deleting PC" });
  }
}

module.exports = {
  createPC,
  getAllPCs,
  getPC,
  updatePC,
  deletePC,
  getPcByUsage,
};
