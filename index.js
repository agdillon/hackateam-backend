const express = require('express')

const port = process.env.PORT || 3000
const app = express()

const usersRouter = require('./routes/users')
const teamsRouter = require('./routes/teams')
const eventsRouter = require('./routes/events')

app.use(express.json())

// routers
app.use('/users', usersRouter)
app.use('/teams', teamsRouter)
app.use('/events', eventsRouter)

// error handler
app.use((err, req, res, next) => {
  err.status = err.status || 500
  err.message = err.message || 'Internal server error'

  res.json(err)
})

// 404
app.use((req, res, next) => {
  res.json({ status: 404, message: 'Not found'})
})

app.listen(port, () => { console.log(`Listening on port ${port}`) })
