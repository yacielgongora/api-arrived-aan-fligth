const Pool = require("pg").Pool;
const moment = require("moment");

var momentTimezone = require("moment-timezone");
const today = moment();
const now = moment(
  momentTimezone.tz(today, "America/Port-au-Prince").utc().format()
);

const pool = new Pool({
  user: "phkeqlnuwgoxzk",
  host: "ec2-54-160-120-28.compute-1.amazonaws.com",
  database: "d6ijk5hdv3knti",
  password: "14352f99098484defcf3cfc9632b0036a823c2aba0ab17ead731aa8cce913f04",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

function updateAllFalse() {
  pool.query(
    `UPDATE arrivals_all.arrivals_all SET display = 'false' WHERE  arrivals_all.datearrival = '${now.format(
      "MM/DD/YYYY"
    )}';`
  );
}

function deleteInsert(obj) {
  pool.query(
    `DELETE FROM arrivals_all.arrivals_all where arrivals_all.datearrival = '${obj.actual_arrival_time.date}'
AND arrivals_all.tailnumber = '${obj.tailnumber}';`,
    function (err, result) {
      if (err) {
        console.log("ERROR DELETING" + err);
      } else {
        pool.query(
          `UPDATE arrivals_all.arrivals_all
SET display = 'false'
WHERE arrivals_all.datearrival = '${obj.actual_arrival_time.date}';`,
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              pool.query(
                `INSERT  INTO arrivals_all.arrivals_all("flightNumber","currentTime","city","tailnumber","datearrival","remarks") VALUES('${obj.ident}','${obj.actual_arrival_time.time}','${obj.origin.city}','${obj.tailnumber}','${obj.actual_arrival_time.date}','${obj.status}')`,
                function (err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(`Insert: ${obj.tailnumber}`);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

const getFlights = (request, response) => {
  const date = request.query.date;
  if (date === undefined) {
    pool.query(
      `SELECT * FROM arrivals_all.arrivals_all where arrivals_all.datearrival = '${now.format(
        "MM/DD/YYYY"
      )}' AND display='true' ORDER BY id ASC `,
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  } else {
    pool.query(
      `SELECT * FROM arrivals_all.arrivals_all WHERE arrivals_all.datearrival = '${date}'`,
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).json(results.rows);
      }
    );
  }
};

const getFlightsDay = (request, response) => {
  const date = request.params.date;
  console.log("request");
};

const createUser = (request, response) => {
  const { name, email } = request.body;

  pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email],
    (error, results) => {
      if (error) {
        throw error;
      } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`);
    }
  );
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (typeof results.rows == "undefined") {
        response.status(404).send(`Resource not found`);
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`User not found`);
      } else {
        response
          .status(200)
          .send(`User modified with ID: ${results.rows[0].id}`);
      }
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  getFlights,
  getFlightsDay,
  createUser,
  updateUser,
  deleteUser,
  deleteInsert,
  updateAllFalse,
};
