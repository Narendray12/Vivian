const dotenv = require("dotenv");
const mongoose = require("mongoose");

const { exec } = require('child_process');

const app = require("./app");

// IMPORTED ROUTES
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const questionRoutes = require("./routes/question");

// CONFIGURATIONS
dotenv.config();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);

app.get('/run-python/:age/:description', (req, res) => {
  let { age, description} = req.params;


  const command = `python check.py ${age} Nan false ${description} fish   `;

  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      if (error.message.includes("Description is not specific enough")) {
        return res.status(400).json({ error: 'Description is not specific enough, hence, no detection.' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (stderr) {
      console.error(`Python script error: ${stderr}`);
      return res.status(500).json({ error: 'Python Script Error' });
    }

    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseError) {
      console.error(`Error parsing Python script output: ${parseError}`);
      res.status(500).json({ error: 'Error parsing Python script output' });
    }
  });
});

// MONGOOSE SETUP
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    }
  })
  .catch((error) => console.log(`${error} did not connect`));

module.exports = app;