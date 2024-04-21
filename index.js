const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TodoTask = require("./models/TodoTask");

dotenv.config();

app.use("/static", express.static("public"));

app.use(express.urlencoded({ extended: true }));

// Connection to db
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to db!");
        app.listen(3000, () => console.log("Server Up and running"));
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });

app.set("view engine", "ejs");

//read operation
app.get("/", async (req, res) => {
    try {
        const tasks = await TodoTask.find({});
        res.render("todo.ejs", { todoTasks: tasks });
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).send("Internal Server Error");
    }
});



//Create operation
app.post('/', async (req, res) => {
    // Check if content is provided in the request body
    if (!req.body.content || req.body.content.trim() === '') {
        return res.status(400).send("Content is required");
    }

    const todoTask = new TodoTask({
        content: req.body.content
    });
    try {
        await todoTask.save();
        res.redirect("/");
    } catch (err) {
        console.error("Error saving todo task:", err);
        res.status(500).send("Internal Server Error");
    }
});


//update operation:
app
    .route("/edit/:id")
    .get(async (req, res) => {
        try {
            const id = req.params.id;
            const tasks = await TodoTask.find({});
            res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
        } catch (err) {
            console.error("Error fetching tasks:", err);
            res.status(500).send("Internal Server Error");
        }
    })
    .post(async (req, res) => {
        try {
            const id = req.params.id;
            await TodoTask.findByIdAndUpdate(id, { content: req.body.content });
            res.redirect("/");
        } catch (err) {
            console.error("Error updating task:", err);
            res.status(500).send("Internal Server Error");
        }
    });


//delete
app.route("/remove/:id").get(async (req, res) => {
    try {
        const id = req.params.id;
        await TodoTask.findOneAndDelete({ _id: id });
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).send("Internal Server Error");
    }
});