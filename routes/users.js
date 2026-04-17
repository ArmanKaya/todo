const render = require("ejs")
const express = require("express")
const usersRouter = express.Router()
var jwt = require('jsonwebtoken');
const sqlite = require("sqlite3")
const db = sqlite

const { createUser, userExists, login, getListsByUsername } = require("../models/usersdb")

usersRouter.get("/profile", (req, res) => {
  res.render("profile")
});



usersRouter.get("/register", (req, res) => {
  res.render("register")
});

usersRouter.get("/login", (req, res) => {
  res.render("login")
});

usersRouter.post("/register", async (req, res) => {
    const { username, password } = req.body;
    console.log("user creating", username, password, await userExists(username))
    if (!username || !password || await userExists(username)) { return res.status(400).render("register", { alert: "bruker med lik informasjon eksisterer allerede" })}
    const newUserId = await createUser(username, password)
    await createUser(username, password)
    console.log(username, password)
    res.redirect("/users/login")
});

usersRouter.post("/login", async (req, res) => {
    //  const { username, password } = req.body; 
    res.clearCookie("selected_account");
    const data = req.body

try{
    console.log(data.username, data.password)
    const token = await login(data.username, data.password)
    res.cookie("token", token, {maxAge: 1000 * 3600})
    console.log(token)
    res.redirect("/")
  }catch (err){
     return res.status(400).render("login", { alert: "brukernavn eller passord er ikke gyldig"})  
  }

})

module.exports = { usersRouter }