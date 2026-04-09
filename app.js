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

const { createUser, userExists, login, createAccount, getListsByUsername, completedTasksInit } = require("./models/usersdb")


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



//middleware
app.use((req, res, next) => {
    try {
        const payload = jwt.verify(req.cookies.token, 'shhhhh')
        user = {id: payload.id, name: payload.nickname}
        console.log(user)
    }

    catch (error) {
        req.user = {}
    } finally {
        console.log(user)
        next()
    }
    
})





app.get('/', async (req, res) => {
  let username = 'profile' // value if user is not authenticated 
  
          // checking if the user is signed in 
    if (req.user && req.user.id) {
    username = req.user.name; // if the user is actually signed in, their nickname from the payload will be displayed
  }
  
  lists = await(getListsByUsername(user.id))

  console.log(lists);
  console.log(typeof lists);

  res.render('index', { username: username, lists});
});

app.post('/', async (req, res) => {
    let username = 'profile' // value if user is not authenticated 
    const newlist = req.body.createList
    const listoption = req.body.select_list
  
          // checking if the user is signed in 
  if (user) {
    username = user.name; // if the user is actually signed in, their nickname from the payload will be displayed
  } else {
    console.log("user is not signed in")
  }

  lists = await(getListsByUsername(user.id))


  
  await(createListdb(user.id, newlist))
  res.render('index', { username: username, listoption: newlist, lists});
})

