const app = require('./app')
const { PORT } = process.env || require('./config/config')

app.listen(PORT, function() {
    console.log('App is listening on port ' + PORT)
})
