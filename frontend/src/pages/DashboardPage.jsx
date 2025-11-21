import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function DashboardPage() {
  const { user, token, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [newTask, setNewTask] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Toast system
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false }), 2500);
  }

  // Fetch tasks
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const res = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data);
      setFiltered(res.data);
    } catch (err) {
      showToast("Failed to load tasks", "error");
    }
  }

  // Add task
  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return showToast("Task title required", "error");

    try {
      const res = await api.post(
        "/tasks/create",
        { title: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = [res.data, ...tasks];
      setTasks(updated);
      filterTasks(updated, search, filter);
      setNewTask("");
      showToast("Task added!");
    } catch {
      showToast("Failed to add task", "error");
    }
  }

  // Delete task
  async function deleteTask(id) {
    await api.delete(`/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updated = tasks.filter((t) => t._id !== id);
    setTasks(updated);
    filterTasks(updated, search, filter);
    showToast("Task deleted");
  }

  // Toggle complete
  async function toggleTask(id) {
    const res = await api.patch(
      `/tasks/${id}/toggle`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updated = tasks.map((t) => (t._id === id ? res.data : t));
    setTasks(updated);
    filterTasks(updated, search, filter);
    showToast("Task updated");
  }

  // Start editing
  function startEdit(task) {
    setEditingId(task._id);
    setEditingTitle(task.title);
  }

  // Save edit
  async function saveEdit(id) {
    const res = await api.put(
      `/tasks/${id}`,
      { title: editingTitle },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updated = tasks.map((t) => (t._id === id ? res.data : t));
    setTasks(updated);
    setEditingId(null);
    filterTasks(updated, search, filter);
    showToast("Task saved!");
  }

  // Filter + search logic
  function filterTasks(list, searchTerm, filterMode) {
    let result = [...list];

    // Search
    if (searchTerm) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter
    if (filterMode === "completed") {
      result = result.filter((t) => t.completed);
    } else if (filterMode === "pending") {
      result = result.filter((t) => !t.completed);
    }

    setFiltered(result);
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    filterTasks(tasks, val, filter);
  }

  function handleFilterChange(mode) {
    setFilter(mode);
    filterTasks(tasks, search, mode);
  }

  return (
    <div className="dashboard-container">

      {/* Toast */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Task Manager</h1>

        <div className="dashboard-user">
          <span>{user?.email}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Add Task */}
      <form className="add-task-form" onSubmit={addTask}>
        <input
          className="add-task-input"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="add-task-btn" type="submit">
          Add
        </button>
      </form>

      {/* Search + Filters */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search tasks..."
          value={search}
          onChange={handleSearchChange}
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            All
          </button>

          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => handleFilterChange("pending")}
          >
            Pending
          </button>

          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => handleFilterChange("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th className="center">Status</th>
              <th className="center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((task) => (
              <tr key={task._id}>
                <td>
                  {editingId === task._id ? (
                    <input
                      className="edit-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                    />
                  ) : (
                    <span className={task.completed ? "task-done" : ""}>
                      {task.title}
                    </span>
                  )}
                </td>

                <td className="center">
                  <button
                    className={`status-btn ${
                      task.completed ? "completed" : "pending"
                    }`}
                    onClick={() => toggleTask(task._id)}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </button>
                </td>

                <td className="center">
                  {editingId === task._id ? (
                    <button
                      className="save-btn"
                      onClick={() => saveEdit(task._id)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => startEdit(task)}
                    >
                      Edit
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && <p className="no-tasks">No tasks found.</p>}
      </div>
    </div>
  );
}
