const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const newToDo = await pool.query(
      "INSERT INTO todo (description, status) VALUES($1, 'active') RETURNING *",
      [description]
    );
    res.json(newToDo.rows[0]);
  } catch (error) {
    console.log("error when create todo: ", { error });
    throw error;
  }
});

app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query(
      "SELECT * FROM todo WHERE status = 'active' ORDER BY todo_id"
    );
    res.json({ toDos: allTodos.rows });
  } catch (error) {
    console.log("error when get todos: ", { error });
    throw error;
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let result = {
      statusCode: 404,
      todo: undefined,
    };
    const todo = await pool.query(
      "SELECT * FROM todo WHERE todo_id = $1 AND status = 'active'",
      [id]
    );
    if (todo.rows.length > 0) {
      result = {
        statusCode: 200,
        todo: todo.rows[0],
      };
    }

    res.status(result.statusCode).json(result.todo).end();
  } catch (error) {
    console.log("error when get a todo: ", { error });
    throw error;
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    let result = {
      statusCode: 404,
    };

    const todo = await pool.query(
      "UPDATE todo SET description = $1 where todo_id = $2",
      [description, id]
    );

    if (todo.rowCount > 0) {
      result = {
        statusCode: 202,
      };
    }
    res.status(result.statusCode).end();
  } catch (error) {
    console.log("error when update a todo: ", { error });
    throw error;
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let result = {
      statusCode: 404,
    };

    const todo = await pool.query(
      "UPDATE todo SET status = 'deactive' where todo_id = $1",
      [id]
    );

    if (todo.rowCount > 0) {
      result = {
        statusCode: 202,
      };
    }
    res.status(result.statusCode).end();
  } catch (error) {
    console.log("error when delete a todo: ", { error });
    throw error;
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
