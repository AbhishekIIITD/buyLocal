const express = require('express');

const router = express.Router();

const {
    getCustomerOrder,
    createCustomerOrder,
    updateCustomerOrder,
    deleteCustomerOrder,
    getAllOrders,
    getOrderById, 
  } = require('../controllers/customer_orders');

  router.route('/')
  .get(getAllOrders)
  .post(createCustomerOrder);

  router.route('/:id')
  .get(getCustomerOrder)
  .put(updateCustomerOrder) 
  .delete(deleteCustomerOrder); 

  router.route('/order/:id').get(getOrderById); // Get order by ID


  module.exports = router;