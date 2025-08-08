// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

// Middleware
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurasi EJS sebagai view engine
app.set("view engine", "ejs");

// Contoh data tugas
let todos = [
  { id: 1, task: "Mengerjakan PR" },
  { id: 2, task: "Membeli bahan makanan" },
];

// --- Rute Utama ---
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/todos-list", (req, res) => {
  res.render("todos-page", { todos: todos });
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

// Middleware 404
app.use((req, res, next) => {
  res.status(404).send("404 - page not found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});