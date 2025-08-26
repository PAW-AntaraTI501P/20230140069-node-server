// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const todoRoutes = require("./routes/tododb.js");
// const todoRoutes = require("./routes/todo.js"); // Uncomment this line if you want to use the dummy data route instead
const path = require("path");
const db = require("./database/db");
const port = process.env.PORT || 3001;

const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
// Middleware
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurasi EJS sebagai view engine
app.set("view engine", "ejs");

let todos = [];

// --- Rute Utama ---
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layouts",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    layout: "layouts/main-layouts",
  });
});



app.use("/todos", todoRoutes);

app.get("/todos-list", (req, res) => {
  res.render("todos-page", { todos: todos, layout: "layouts/main-layouts" });
});

app.get("/todo-view", (req, res) => {
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) {
      console.error("Error fetching todos:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("todo", { todos: todos, layout: "layouts/main-layouts" });
  });
});


// --- Rute CRUD ---
// CREATE: Menambah tugas baru
app.post("/add-todo", (req, res) => {
  const newTask = req.body.task;
  const newId = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
  todos.push({ id: newId, task: newTask });
  res.redirect("/todos-list");
});

// UPDATE: Menangani pengiriman formulir edit
app.post("/update-todo/:id", (req, res) => {
  const todoId = parseInt(req.params.id);
  const updatedTask = req.body.task;

  // Mencari indeks (posisi) tugas di dalam array 'todos'
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  // Jika tugas ditemukan (indeks bukan -1), perbarui teks tugasnya
  if (todoIndex !== -1) {
    todos[todoIndex].task = updatedTask;
  }

  // Setelah selesai, arahkan kembali ke halaman daftar tugas
  res.redirect("/todos-list");
});

// DELETE: Menghapus tugas
app.post("/delete-todo/:id", (req, res) => {
  const todoId = parseInt(req.params.id);
  todos = todos.filter((todo) => todo.id !== todoId);
  res.redirect("/todos-list");
});



// GET: Mengambil semua todos
app.get("/api/todos", (req, res) => {
  console.log("Menerima permintaan GET untuk todos.");
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Berhasil mengirim todos:", todos.length, "item.");
    res.json({ todos: todos });
  });
});

// POST: Menambah todo baru
app.post("/api/todos", (req, res) => {
    const { task } = req.body;
    console.log("Menerima permintaan POST untuk menambah task:", task);

    if (!task) {
        console.error("Task tidak ditemukan di body permintaan.");
        return res.status(400).json({ error: 'Task is required' });
    }
    const query = 'INSERT INTO todos (task, completed) VALUES (?, ?)';
    db.query(query, [task, false], (err, result) => {
        if (err) {
            console.error("Database insert error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Todo berhasil ditambahkan dengan ID:", result.insertId);
        res.status(201).json({ 
            message: 'Todo added successfully', 
            id: result.insertId,
            task, 
            completed: false 
        });
    });
});

// PUT: Memperbarui status 'completed' saja
app.put("/api/todos/:id", (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    console.log(`Menerima permintaan PUT untuk ID: ${id} dengan status completed: ${completed}`);

    // Validasi input
    if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: "Invalid 'completed' value. Must be a boolean." });
    }
    
    const query = 'UPDATE todos SET completed = ? WHERE id = ?';

    db.query(query, [completed, id], (err, result) => {
        if (err) {
            console.error("Database update error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.affectedRows === 0) {
            console.error("Todo tidak ditemukan untuk ID:", id);
            return res.status(404).json({ error: 'Todo not found' });
        }
        console.log(`Todo dengan ID ${id} berhasil diperbarui.`);
        res.json({ message: 'Todo updated successfully' });
    });
});

// DELETE: Menghapus todo berdasarkan ID
app.delete("/api/todos/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Menerima permintaan DELETE untuk ID: ${id}`);
    const query = 'DELETE FROM todos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Database delete error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.affectedRows === 0) {
            console.error("Todo tidak ditemukan untuk ID:", id);
            return res.status(404).json({ error: 'Todo not found' });
        }
        console.log(`Todo dengan ID ${id} berhasil dihapus.`);
        res.json({ message: 'Todo deleted successfully' });
    });
});

// Middleware 404
app.use((req, res, next) => {
  res.status(404).send("404 - page not found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});