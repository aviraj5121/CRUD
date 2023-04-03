// Require the necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Set up the Express.js app
const app = express();
const port = 3000;

// Set up the MongoDB connection
mongoose.connect('mongodb://localhost:27017/student', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define the data schema
const dataSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  mobileNumber: Number, // Changed field name to follow JavaScript naming convention
});

const Data = mongoose.model('Data', dataSchema);

// Set up the middleware for parsing incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define the routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit-data', (req, res) => {
  const myData = new Data(req.body);
  myData.save()
    .then(item => {
      res.json({ message: "Data saved to database" });
    })
    .catch(err => {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(400).json({ message: "Duplicate ID found in database" });
      } else {
        res.status(400).json({ message: "Unable to save data to database" });
      }
    });
});

// Add the fetch route
app.get('/fetch-data/:id', (req, res) => {
  const id = req.params.id;
  Data.findOne({ id: id })
    .then(data => {
      if (!data) {
        res.status(404).json({ message: "Data not found" });
      } else {
        res.json(data);
      }
    })
    .catch(err => {
      res.status(400).json({ message: "Unable to fetch data from database" });
    });
});

// Add the update route
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
