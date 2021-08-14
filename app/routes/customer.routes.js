module.exports = (app) => {
  const customers = require("../controllers/customer.controller.js");
  const db = require("../postgres/query.js");

  // Create a new Customer
  app.post("/customers", customers.findAll);

  // Retrieve all Customers
  // app.get("/arrived", customers.findAll);
  app.get("/arrived", db.getFlights);

  // Retrieve a single Customer with customerId
  app.get("/arrived/:date", db.getFlightsDay);

  // Update a Customer with customerId
  app.put("/customers/:customerId", customers.update);

  // Delete a Customer with customerId
  app.delete("/customers/:customerId", customers.delete);

  // Create a new Customer
  app.delete("/customers", customers.deleteAll);
};
