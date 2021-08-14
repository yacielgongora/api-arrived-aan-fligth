const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const customers = require("./app/controllers/customer.controller.js");
const app = express();
var cors = require("cors");
const sql = require("./app/models/db.js");
const moment = require("moment");
var momentTimezone = require("moment-timezone");
const now = moment();
var _ = require("lodash");
const db = require("./app/postgres/query.js");
// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cors());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({
    message: `Welcome to API fligths arrived by Atalou MicroSystem, /arrived => for flights arrived`,
  });
});

require("./app/routes/customer.routes.js")(app);

///asyn function for delete

function deleteInsert(obj) {
  db.deleteInsert(obj);
}

function updateAllFalse() {
  db.updateAllFalse();
}

//validate departures datetime
function validateDeparture(arriv, dep) {
  const a = moment.unix(arriv.actual_arrival_time.localtime);
  const d = moment.unix(dep.actual_departure_time.localtime);
  const arrival = moment(
    momentTimezone.tz(a, "America/Port-au-Prince").utc().format()
  );
  const departs = moment(
    momentTimezone.tz(d, "America/Port-au-Prince").utc().format()
  );
  const finalT = now.isBetween(arrival, departs);
  return finalT;
}
//call API fligths
function callAPI() {
  axios({
    url:
      "https://flightxml.flightaware.com/json/FlightXML3/AirportBoards?airport_code=MTPP&type=arrivals scheduled",
    auth: {
      username: "ataloums",
      password: "6b0da22f1666c08469027aab5fa4cc62b421a8bc",
    },
  })
    .then(function (response) {
      const { arrivals, scheduled } = response.data.AirportBoardsResult;

      const serverTime = moment(
        momentTimezone.tz(now, "America/Port-au-Prince").utc().format()
      ).format("MM/DD/YYYY");
      const arrivalsFilter = arrivals.flights.filter(
        (a) => a.actual_arrival_time.date === serverTime
      );
      const sheduledFilter = scheduled.flights.filter(
        (a) => a.estimated_departure_time.date === serverTime
      );
      const result = _.intersectionBy(
        arrivalsFilter,
        sheduledFilter,
        (a) => a.tailnumber || a.ident
      );
      if (result.length === 0) {
        updateAllFalse();
      } else {
        result.map((a) => {
          deleteInsert(a);
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

// set port, listen for requests
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  callAPI();
  console.log(`Server is running on port ${PORT}.`);
  var interval = setInterval(function () {
    callAPI();
  }, 300000);
});
