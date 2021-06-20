const express = require("express")
const route = express.Router()
const controllers = require('./controller/controller')

route.get('/saySomething', controllers.saySomething)

module.exports = route