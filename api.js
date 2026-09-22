require('dotenv').config();
const os = require('os');
const mongoose = require('mongoose');
const Sensor = require('./models/sensor');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const serveraddress = process.env.MONGO_URI;

if (!serveraddress) {
    console.error('Missing MONGO_URI environment variable. Set it before starting the server.');
    process.exit(1);
}

mongoose.connect(serveraddress);

// Used to identify which EC2 instance served a given request —
// makes it easy to prove the load balancer is actually alternating
// between your two instances in your evidence screenshots.
const hostname = os.hostname();

// all the sensor readings in MongoDB
app.get('/', async function (req, res) {
    const filter = {}; // get all documents.
    const all = await Sensor.find(filter);
    res.send({ servedBy: hostname, data: all }); // send the documents + server identity back to the client.
});

// all the sensor readings with an ID in MongoDB
app.get('/:id', async function (req, res) {
    const filter = { _id: req.params.id }; // get documents by ID.
    const all = await Sensor.find(filter);
    res.send({ servedBy: hostname, data: all });
});

// submit a new value
app.post('/', async function (req, res) {

    // Generate a temperature value.
    const low = 10;
    const high = 40;
    const reading = Math.floor(Math.random() * (high - low) + low);

    // Create a new sensor reading.
    const newSensor = new Sensor({
        name: "temperaturesensor",
        address: "221 Burwood Hwy, Burwood VIC 3125",
        time: Date.now(),
        temperature: reading
    });

    newSensor.save().then(doc => {
        console.log("Saving Sensor reading to Database");
        console.log(doc);
    });

    res.send({ servedBy: hostname, message: 'Added Data!' }); // return back to the client.
});

app.listen(port, () => {
    console.log(`[${hostname}] listening on port ${port}`);
});
