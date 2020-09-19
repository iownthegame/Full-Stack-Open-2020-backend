require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const Person = require('./models/person')
const { response } = require('express')

morgan.token('data', function getData (req) {
  return JSON.stringify(req.body)
})

const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())
app.use(express.static('build'))

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122"
  }
]

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
  res.send(`Phonebook has info for ${persons.length} people<br><br>${new Date()}`)
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
  .then(person => {
      res.json(person)
  })
  .catch((error) =>{
      res.status(404).end()
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const generateId = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  }

  const record = persons.find(person => person.name === body.name)
  if (record) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(10000),
  }
  persons = persons.concat(person)

  res.json(person)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
