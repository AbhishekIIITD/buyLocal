const express = require("express");
const bcrypt = require('bcryptjs');
const fileUpload = require("express-fileupload");
const cors = require("cors");

// Import existing routers
const productsRouter = require("./routes/products");
const productImagesRouter = require("./routes/productImages");
const categoryRouter = require("./routes/category");
const searchRouter = require("./routes/search");
const mainImageRouter = require("./routes/mainImages");
const userRouter = require("./routes/users");
const orderRouter = require("./routes/customer_orders");
const slugRouter = require("./routes/slugs");
const orderProductRouter = require('./routes/customer_order_product');
const wishlistRouter = require('./routes/wishlist');

// Import new routers for BuyLocal
const cartRouter = require('./routes/cart');
const addressRouter = require('./routes/Address');
const notificationRouter = require('./routes/notification');
const deliveryZoneRouter = require('./routes/deliveryZone');
const productRatingRouter = require('./routes/productRating');

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(fileUpload());

// Existing routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/images", productImagesRouter);
app.use("/api/main-image", mainImageRouter);
app.use("/api/users", userRouter);
app.use("/api/search", searchRouter);
app.use("/api/orders", orderRouter);
app.use('/api/order-product', orderProductRouter);
app.use("/api/slugs", slugRouter);
app.use("/api/wishlist", wishlistRouter);

// New routes for BuyLocal
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/delivery-zone", deliveryZoneRouter);
app.use("/api/product-rating", productRatingRouter);


// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;