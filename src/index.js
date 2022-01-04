const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];

// Check if a user account exists
function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json("User not found");
  }

  request.user = user;
  return next();
}

// Create user
app.post("/user", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response
      .status(400)
      .json({ error: "User with this username already exists" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).send();
});

// List todos of a user
app.get("/todos", checkExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

// Create Todos
app.post("/todos", checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    create_at: new Date(),
  });

  return response.status(201).send();
});

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todos) => todos.id === id);

  if (!index) {
    return response.status(404).json({ erro: "Bad Request" });
  }

  user.todos[index].title = title;
  user.todos[index].deadline = new Date(deadline);

  return response.status(200).send();
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todos) => todos.id === id);

  if (!index) {
    return response.status(404).json({ erro: "Bad Request" });
  }

  user.todos[index].done = true;

  return response.status(200).send();
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todos) => todos.id === id);

  if (!index) {
    return response.status(404).json({ erro: "Bad Request" });
  }

  user.todos.splice(index, 1);

  return response.status(200).send();
});

app.listen(3030);

/**
 * Notes: Date format(year-month-day)
 */
