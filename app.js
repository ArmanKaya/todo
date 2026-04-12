const express = require("express")
const app = express()
const jwt = require('jsonwebtoken');




const path = require("path")
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")));

const bodyParser = require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser")
app.use(cookieParser())

const port = 3001;
//routers
const { usersRouter } = require("./routes/users");
const { createListdb } = require("./models/usersdb");
app.use("/users", usersRouter);

const { createUser, userExists, login, createAccount, getListsByUsername, getTasksByListid, createTask, updateTaskStatus, createNote, getNotesByUserId } = require("./models/usersdb")


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



//middleware
app.use((req, res, next) => {
    try {
        const payload = jwt.verify(req.cookies.token, 'shhhhh')
        req.user = {id: payload.id, name: payload.nickname}
        console.log(req.user)
    }

    catch (error) {
        req.user = {}
    } finally {
        next()
    }
    
})





app.get('/', async (req, res) => {
  let username = 'profile' // value if user is not authenticated 
  const selectedListIdFromQuery = req.query.select_list

  // checking if the user is signed in 
  if (req.user && req.user.id) {
    username = req.user.name; // if the user is actually signed in, their nickname from the payload will be displayed
  } else {
    return res.render('index', { username, lists: [], tasks: [], notes: [], selectedListId: "" })
  }

  const lists = await getListsByUsername(req.user.id)

  let selectedListId = selectedListIdFromQuery
  if (!selectedListId && lists.length > 0) {
    selectedListId = String(lists[0].id)
  }

  
  let tasks = []
  if (selectedListId) {
    tasks = await getTasksByListid(selectedListId)
  }

  const notes = await getNotesByUserId(req.user.id)

  res.render('index', { username: username, lists, tasks, notes, selectedListId })
})

app.post('/', async (req, res) => {
    const newlist = req.body.createList
    const listoption = req.body.select_list
    const taskcontent = req.body.taskcontent
    const noteTitle = req.body.noteTitle
    const noteContent = req.body.noteContent

    if (!req.user || !req.user.id) {
      return res.redirect("/users/login")
    }

    if (newlist) {
      await createListdb(req.user.id, newlist)
      return res.redirect("/" + newListId)
    }

    if (taskcontent && listoption) {
      await createTask(listoption, taskcontent, 0)
      return res.redirect("/?select_list=" + listoption)
    }

    if (noteTitle || noteContent) {
      await createNote(req.user.id, noteTitle, noteContent)
      return res.redirect("/")
    }

    return res.redirect("/")
})

app.post("/tasks/toggle", async (req, res) => {
  const taskId = req.body.task_id
  const isCompleted = req.body.is_completed ? 1 : 0
  const selectedListId = req.body.select_list

  await updateTaskStatus(taskId, isCompleted)

  if (selectedListId) {
    return res.redirect("/?select_list=" + selectedListId)
  }

  return res.redirect("/")
})
