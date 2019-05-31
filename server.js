const express = require('express')
const app = require('./app')

const { PORT } = require('./config/config')

app.listen(PORT)
console.log('App is listening on port ' + PORT)
