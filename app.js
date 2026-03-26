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
app.use("/users", usersRouter);


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
        console.log(req.user)
        next()
    }
    
})





app.get("/", (req, res) => {
    res.render("index", {username: req.user.name })
})