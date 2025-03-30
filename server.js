const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { PythonShell } = require("python-shell");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,tlsAllowInvalidCertificates: true });

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

// Job Schema
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: String,
});
const Job = mongoose.model("Job", JobSchema);

// Register
app.post("/api/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({ ...req.body, password: hashedPassword });
  await user.save();
  res.status(201).send("User registered successfully");
});

// Login
app.post("/api/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).send("Invalid credentials");
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Post Job
app.post("/api/jobs", async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.status(201).send(job);
});

// Get Jobs
app.get("/api/jobs", async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

// Resume Screening (AI)
const upload = multer({ dest: "uploads/" });
app.post("/api/screen-resume", upload.single("resume"), (req, res) => {
  let options = { mode: "text", pythonOptions: ["-u"], scriptPath: "./", args: [req.file.path] };
  PythonShell.run("resume_screening.py", options, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ score: results[0] });
  });
});

// Start Server
app.get("/", (req, res) => {
    res.send("Backend is working!");
});

app.listen(5000, () => console.log("Server running on port 5000"));
 
