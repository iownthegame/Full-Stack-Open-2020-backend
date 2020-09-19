require('dotenv').config()

const express = require('express')
const morgan = require('morgan')

const Person = require('./models/person')

morgan.token('data', function getData (req) {
  return JSON.stringify(req.body)
})

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/api/persons', (_req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (_req, res, next) => {
  Person.countDocuments({}, function(error, count){
    if (error) {
      return next(error)
    }
    res.send(`Phonebook has info for ${count} people<br><br>${new Date()}`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(_result => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then((savedPerson) => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  // js object, not Person constructor
  const person = {
    number: body.number,
  }

  const opts = { runValidators: true, new: true }
  Person.findByIdAndUpdate(req.params.id, person, opts)
    .then(updatedNote => res.json(updatedNote))
    .catch(error => next(error))
})

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
