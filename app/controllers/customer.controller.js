const Fligth = require("../models/customer.model.js");

// Create and Save a new Fligth
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a Fligth
  const customer = new Fligth({
    email: req.body.email,
    name: req.body.name,
    active: req.body.active,
  });

  // Save Fligth in the database
  Fligth.create(customer, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Fligth.",
      });
    else res.send(data);
  });
};

// Retrieve all Fligths from the database.
exports.findAll = (req, res) => {
  Fligth.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers.",
      });
    else res.send(data);
  });
};

// Find a single Fligth with a customerId
exports.findOne = (req, res) => {
  Fligth.findById(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Fligth with id ${req.params.customerId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Fligth with id " + req.params.customerId,
        });
      }
    } else res.send(data);
  });
};

// Update a Fligth identified by the customerId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  console.log(req.body);

  Fligth.updateById(
    req.params.customerId,
    new Fligth(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Fligth with id ${req.params.customerId}.`,
          });
        } else {
          res.status(500).send({
            message: "Error updating Fligth with id " + req.params.customerId,
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Fligth with the specified customerId in the request
exports.delete = (req, res) => {
  Fligth.remove(req.params.customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Fligth with id ${req.params.customerId}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Fligth with id " + req.params.customerId,
        });
      }
    } else res.send({ message: `Fligth was deleted successfully!` });
  });
};

// Delete all Fligths from the database.
exports.deleteAll = (req, res) => {
  Fligth.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all customers.",
      });
    else res.send({ message: `All Fligths were deleted successfully!` });
  });
};
