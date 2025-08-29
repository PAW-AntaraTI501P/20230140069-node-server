const express = require("express");
const router = express.Router();

let todos = [
  { id: 1, task: "Belajar Node.js" },
  { id: 2, task: "Membuat API" },
];

router.get("/", (req, res) => {
  res.json(todos);
});

router.get("/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).send("Tugas tidak ditemukan");
  res.json(todo);
});

router.post("/", (req, res) => {
  if (!req.body.task) return res.status(400).json({ error: "Task is required" });
  const newTodo = {
    id: todos.length + 1,
    task: req.body.task,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

router.put("/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).send("Tugas tidak ditemukan");
  if (!req.body.task) return res.status(400).json({ error: "Task is required" });
  todo.task = req.body.task;
  res.json(todo);
});

router.delete("/:id", (req, res) => {
  const todoIndex = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (todoIndex === -1) return res.status(404).send("Tugas tidak ditemukan");
  todos.splice(todoIndex, 1);
  res.status(204).send();
});

module.exports = { router, todos };