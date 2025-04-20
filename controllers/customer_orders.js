const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCustomerOrder(request, response) {
  try {
    const {
      name,
      lastname,
      phone,
      email,
      company,
      address,
      apartment,
      postalCode,
      status,
      city,
      country,
      orderNotice,
      total,
    } = request.body;
    const id=`prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    



    const corder = await prisma.customer_order.create({
      data: {
        id,
        name,
        lastname,
        phone,
        email,
        company,
        address,
        apartment,
        postalCode,
        status,
        city,
        country,
        orderNotice,
        total,
        company,
      },
    });
    return response.status(201).json(corder);
  } catch (error) {
    console.error("Error creating order:", error);
    return response.status(500).json({ error: "Error creating order" });
  }
}

async function updateCustomerOrder(request, response) {
  try {
    const { id } = request.params;
    const {
      name,
      lastname,
      phone,
      email,
      company,
      adress,
      apartment,
      postalCode,
      dateTime,
      status,
      city,
      country,
      orderNotice,
      total,
    } = request.body;

    const existingOrder = await prisma.customer_order.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingOrder) {
      return response.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await prisma.customer_order.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        name,
        lastname,
        phone,
        email,
        company,
        adress,
        apartment,
        postalCode,
        dateTime,
        status,
        city,
        country,
        orderNotice,
        total,
      },
    });

    return response.status(200).json(updatedOrder);
  } catch (error) {
    return response.status(500).json({ error: "Error updating order" });
  }
}

async function deleteCustomerOrder(request, response) {
  try {
    const { id } = request.params;
    await prisma.customer_order.delete({
      where: {
        id: id,
      },
    });
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ error: "Error deleting order" });
  }
}

async function getCustomerOrder(request, response) {
  const { email } = request.params;
  const order = await prisma.customer_order.findUnique({
    where: {
      email: email,
    },
  });
  if (!order) {
    return response.status(404).json({ error: "Order not found" });
  }
  return response.status(200).json(order);
}

async function getOrderById(request, response) {
  const { id } = request.params;
  const order = await prisma.customer_order.findUnique({
    where: {
      id: id,
    },
  });
  if (!order) {
    return response.status(404).json({ error: "Order not found" });
  }
  return response.status(200).json(order);
}

async function getAllOrders(request, response) {
  try {
    const orders = await prisma.customer_order.findMany({});
    return response.json(orders);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Error fetching orders" });
  }
}

async function getActiveOrders(request, response) {
  const { email } = request.body;
  try {
    const activeOrders = await prisma.customer_order.findMany({
      where: {
        email: email,
        status: "active", // Assuming "active" is the status for ongoing orders
      },
      include: {
        // If you want to include products in the order, adjust accordingly
        customer_order_product: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Error fetching orders" });
  }
}

module.exports = {
  createCustomerOrder,
  updateCustomerOrder,
  deleteCustomerOrder,
  getCustomerOrder,
  getActiveOrders,
  getAllOrders,
  getOrderById,
};
