const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const {orderId} = req.params;
  const foundOrder = orders.find(order => order.id === orderId);
  
  if (foundOrder) {
    res.locals.dish = foundOrder;
    return next();
  } else {
    next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
  }
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
        status: 400,
        message: `Must include a ${propertyName}`
    });
  };
}

function dishesBodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    const dishesData = data.dishes;

    for (let i = 0; i < dishesData.length; i++) {
      if (!Number.isInteger(dishesData[i][propertyName]) || dishesData[i][propertyName] <= 0) {
        return next({
          status: 400,
          message: `The dish ${i} must have a quantity that is an integer greater than 0`
        });
      }
    }

    next();
  };
}


function dishesValidation(req, res, next) {
  const { data } = req.body;
  const dishesData = data.dishes;
  if (!data || !Array.isArray(dishesData) || dishesData.length === 0 ) {
    return next({
      status: 400,
      message: 'The "dish" array must not be empty',
    });
  }

  next();
}


function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes, } = {} } = req.body;

  // Create a new order object
  const newOrder = {
    id: +nextId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes, // Create a copy of the dishes array
  };

  // Assuming you have an "orders" array to store orders
  orders.push(newOrder);

  // Respond with a 201 status and the newly created order
  res.status(201).json({ data: newOrder });
}

//read

function orderExists(req, res, next) {
  const {orderId} = req.params;
  const foundOrder = orders.find(order => order.id == orderId);
  
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  } else {
    next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
  }
}


function read(req, res, next) {
  res.json({ data: res.locals.order });
};

//update

function validateStatus(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes, } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (validStatus.includes(status)) {
    next();
  } else {
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
    });
  }
}

function update(req, res, next) {
  const { orderId } = req.params;
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes, id } = {} } = req.body;
  
  if(id === undefined || id === null || id === "" || id == order.id) {
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  
  res.json({ data: order });
  } else {
    next({
      status: 400,
      message: `The id: ${orderId} does not match ${id}`
    });
  }
}

//destroy

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  const order = orders[index];

  if (order.status !== 'pending') {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  }

  // Use splice() to remove the order from the array
  orders.splice(index, 1);

  res.sendStatus(204);
}

//list

function list(req, res) {
  const { orderId } = req.params;
  res.json({ data: orders.filter(orderId ? order => order.id == orderId : () => true) });
}


module.exports = {
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesBodyDataHas("quantity"),
    dishesValidation,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesBodyDataHas("quantity"),
    dishesValidation,
    validateStatus,
    update,
  ],
  delete: [orderExists, destroy],
  list
}