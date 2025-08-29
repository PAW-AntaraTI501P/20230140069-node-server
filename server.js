// server.js
require("dotenv").config();
const express = require("express");
const app = express();
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

// Konfigurasi view engine
app.set("view engine", "ejs");

// --- Routing Halaman ---
app.get("/", (req, res) => {
  res.render("index", { layout: "layouts/main-layouts" });
});

app.get("/contact", (req, res) => {
  res.render("contact", { layout: "layouts/main-layouts" });
});

// Halaman menampilkan todos
app.get("/todos-list", (req, res) => {
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("todos-page", { todos: todos, layout: "layouts/main-layouts" });
  });
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

// --- API Endpoints CRUD ---
// GET semua todos
app.get("/api/todos", (req, res) => {
  const { search } = req.query;
  console.log(
    `Menerima permintaan GET untuk todos. Kriteria pencarian: '${search}'`
  );

  let query = "SELECT * FROM todos";
  const params = [];

  if (search) {
    query += " WHERE task LIKE ?";
    params.push(`%${search}%`);
  }

  db.query(query, params, (err, todos) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Berhasil mengirim todos:", todos.length, "item.");
    res.json({ todos: todos });
  });
});

// POST tambah todo baru
app.post("/api/todos", (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: "Task is required" });

  const query = "INSERT INTO todos (task, completed) VALUES (?, ?)";
  db.query(query, [task, false], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    res.status(201).json({ id: result.insertId, task, completed: false });
  });
});

// PUT update todo (task dan/atau completed)
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  // Validasi completed jika ada
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "Completed must be boolean" });
  }

  // Buat query dinamis
  let query = "UPDATE todos SET ";
  const params = [];

  if (task !== undefined) {
    query += "task = ?";
    params.push(task);
  }

  if (completed !== undefined) {
    if (params.length > 0) query += ", ";
    query += "completed = ?";
    params.push(completed);
  }

  query += " WHERE id = ?";
  params.push(id);

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo updated successfully" });
  });
});

// DELETE todo berdasarkan ID
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM todos WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted successfully" });
  });
});

// --- Routing CRUD via Form (EJS) ---
// Tambah todo
app.post("/add-todo", (req, res) => {
  const { task } = req.body;
  if (!task) return res.redirect("/todos-list");

  db.query("INSERT INTO todos (task, completed) VALUES (?, ?)", [task, false], (err) => {
    if (err) console.error(err);
    res.redirect("/todos-list");
  });
});

// Update todo via form
app.post("/update-todo/:id", (req, res) => {
  const todoId = req.params.id;
  const updatedTask = req.body.task;

  db.query("UPDATE todos SET task = ? WHERE id = ?", [updatedTask, todoId], (err) => {
    if (err) console.error(err);
    res.redirect("/todos-list");
  });
});

// Hapus todo via form
app.post("/delete-todo/:id", (req, res) => {
  const todoId = req.params.id;
  db.query("DELETE FROM todos WHERE id = ?", [todoId], (err) => {
    if (err) console.error(err);
    res.redirect("/todos-list");
  });
});

// Middleware 404
app.use((req, res) => {
  res.status(404).send("404 - page not found");
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
