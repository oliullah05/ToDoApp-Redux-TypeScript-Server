require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use(cors());
// 4JKEMM0oO3o8jtCi
// for-practise
const uri = process.env.uri;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

(async () => {
  try {
   client.connect();
    const db = await client.db("for-practise");
    const tasksCollection = db.collection("redux-todo-app");

    console.log("Successfully connected to MongoDB!");

    app.get("/", (req, res) => {
      res.send("Task Master Server");
    });

    app.get("/tasks", async (req, res) => {
      let query = {};
      if (req?.query?.priority) {
        query.priority = req.query.priority
      }
      try {
        const tasks = (await tasksCollection.find(query).toArray()).sort((a, b) => {
          return a.isCompleted - b.isCompleted;
        })
        return res.json(tasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/tasks", async (req, res) => {
      const newTask = req.body;

      try {
        const result = await tasksCollection.insertOne(newTask);
        res.status(201).json(result);
      } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/tasks/:id", async (req, res) => {
      const taskId = req.params.id;

      try {
        const result = await tasksCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        if (result.deletedCount === 0) {
          res.status(404).json({ error: "Task not found" });
        } else {
          res.json({ message: "Task deleted successfully" });
        }
      } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.put("/tasks/:id", async (req, res) => {
      const taskId = req.params.id;
      const updatedTaskData = req.body;

      try {
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedTaskData }, {
          upsert: true
        }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ error: "Task not found" });
        } else {
          res.json({ message: "Task updated successfully" });
        }
      } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error(error);
  }
})();

app.listen(port, () => {
  console.log(`Task master server is running on port ${port}`);
});
