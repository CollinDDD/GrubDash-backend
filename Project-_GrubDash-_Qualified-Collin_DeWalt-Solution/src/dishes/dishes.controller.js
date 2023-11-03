const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//create


function dishExists(req, res, next) {
  const {dishId} = req.params;
  const foundDish = dishes.find(dish => dish.id === dishId);
  
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  } else {
    next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
  }
}

function positiveNumber(req, res, next) {
  const { data: {price} = {} } = req.body;
  if (price > 0) {
    next();
  } else {
    next({
      status: 400,
      message: `the price must be a value of "0" or greater`
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

function create(req, res, next) {
  const {data: {name, description, price, image_url} = {} } = req.body;
  const newDish = {
    id: +nextId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish});
}

//read

function read(req, res, next) {
  res.json({ data: res.locals.dish });
};

//update

function idMatch(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  // Convert id to a number
 

  // Compare the numbers
  if (id === dishId) {
    next();
  } else {
    next({
      status: 400,
      message: `The id: ${dishId} does not match ${id}` ,
    });
  }
}

function validateNumber(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (typeof price === 'number') {
    next();
  } else {
    next({
      status: 400,
      message: `The price must be a valid number.`,
    });
  }
}



function update(req, res, next) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url, id } = {} } = req.body;

  if (id === undefined || id === null || id === "" || id == dish.id) {
    // Convert the price to a number
    const priceAsNumber = parseFloat(price);

    if (!isNaN(priceAsNumber)) {
      // Update the dish
      dish.name = name;
      dish.description = description;
      dish.price = priceAsNumber; // Use the converted price
      dish.image_url = image_url;

      res.json({ data: dish });
    } else {
      next({
        status: 400,
        message: `The price must be a valid number.`,
      });
    }
  } else {
    next({
      status: 400,
      message: `The id: ${dish.id} does not match ${id}`,
    });
  }
}

//list

function list(req, res) {
  const { dishId } = req.params;
  res.json({ data: dishes.filter(dishId ? dish => dish.user_id == dishId : () => true) });
}



module.exports = {
  create: [
           bodyDataHas("name"),
           bodyDataHas("description"),
           bodyDataHas("price"),
           bodyDataHas("image_url"),
           positiveNumber,
           create
          ],
  read: [dishExists, read],
  update: [
           dishExists,
           validateNumber,
           bodyDataHas("name"),
           bodyDataHas("description"),
           bodyDataHas("price"),
           bodyDataHas("image_url"),
           positiveNumber,
           update,
           idMatch,
          ],
  list
}
