// src/routes/todo.js
const express = require("express");
const db = require("../database/db");
const router = express.Router();

// GET semua todos
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM todos";
    const params = [];

    if (search) {
      query += " WHERE task LIKE ?";
      params.push(`%${search}%`);
    }

    const [rows] = await db.query(query, params);
    res.json({ todos: rows });
  } catch (err) {
    console.error("Gagal mengambil data todo:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST tambah todo baru
router.post("/", async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }

  try {
    const [result] = await db.query("INSERT INTO todos (task, completed) VALUES (?, ?)", [task, false]);
    res.status(201).json({ id: result.insertId, task, completed: false });
  } catch (err) {
    console.error("Gagal menambahkan todo:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT update todo
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

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

  try {
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo updated successfully" });
  } catch (err) {
    console.error("Gagal memperbarui todo:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE todo berdasarkan ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM todos WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("Gagal menghapus todo:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;