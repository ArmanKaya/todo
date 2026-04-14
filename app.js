const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const port = 3001;

// ROUTERS
const { usersRouter } = require("./routes/users");

// IMPORTANT: this is what makes /users/profile work
app.use("/users", usersRouter);

const {
  createListdb,
  getListsByUsername,
  getTasksByListid,
  createTask,
  updateTaskStatus,
  createNote,
  getNotesByUserId,
  updateNote,
  deleteNote,
  createUser
} = require("./models/usersdb");

// LISTEN (MUST BE ACTIVE OR EVERYTHING "AUTO EXITS")
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// middleware
app.use((req, res, next) => {
  try {
    const payload = jwt.verify(req.cookies.token, "shhhhh");
    req.user = { id: payload.id, name: payload.nickname };
  } catch (error) {
    req.user = {};
  } finally {
    next();
  }
});

// HOME
app.get("/", async (req, res) => {
  let username = "profile";
  const selectedListIdFromQuery = req.query.select_list;

  if (req.user && req.user.id) {
    username = req.user.name;
  } else {
    return res.render("index", {
      username,
      lists: [],
      tasks: [],
      notes: [],
      selectedListId: "",
    });
  }

  const lists = await getListsByUsername(req.user.id);

  let selectedListId = selectedListIdFromQuery;

  if (!selectedListId && lists.length > 0) {
    selectedListId = lists[lists.length - 1].id;
  }

  let tasks = [];
  if (selectedListId) {
    tasks = await getTasksByListid(selectedListId);
  }

  const notes = await getNotesByUserId(req.user.id);

  res.render("index", {
    username,
    lists,
    tasks,
    notes,
    selectedListId,
  });
});

// MAIN POST
app.post("/", async (req, res) => {
  const newlist = req.body.createList;
  const listoption = req.body.select_list;
  const taskcontent = req.body.taskcontent;
  const noteTitle = req.body.noteTitle;
  const noteContent = req.body.noteContent;

  if (!req.user || !req.user.id) {
    return res.redirect("/users/login");
  }

  if (newlist) {
    const newListId = await createListdb(req.user.id, newlist);
    return res.redirect("/?select_list=" + newListId);
  }

  if (taskcontent && listoption) {
    await createTask(listoption, taskcontent, 0);
    return res.redirect("/?select_list=" + listoption);
  }

  if (noteTitle || noteContent) {
    await createNote(req.user.id, noteTitle, noteContent);
    return res.redirect("/");
  }

  return res.redirect("/");
});

// TASK TOGGLE
app.post("/tasks/toggle", async (req, res) => {
  const { task_id, is_completed, select_list } = req.body;

  if (!req.user?.id) return res.redirect("/users/login");

  const completed = Number(is_completed); 

  await updateTaskStatus(task_id, completed);

  return res.redirect("/?select_list=" + select_list);
});

// NOTES DELETE
app.post("/notes/delete", async (req, res) => {
  const { note_id } = req.body;

  if (!req.user?.id) return res.redirect("/users/login");

  await deleteNote(note_id);

  return res.redirect("/");
});

// NOTES EDIT
app.post("/notes/edit", async (req, res) => {
  const { note_id, title, content } = req.body;

  if (!req.user?.id) return res.redirect("/users/login");

  await updateNote(note_id, title, content);

  return res.redirect("/");
});