const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const baseUrl = '/api/persons'
const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response, next) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())

// configure logging with morgan
morgan.token('body', (req, res) => {
  return req.method === 'POST' 
    ? JSON.stringify(req.body)
    : ''
})

// app.use(morgan('tiny'))
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.req(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res),
  ].join(' ')
}))

// app.use(requestLogger)


let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "01013657064",
    id: 3
  }
]

app.get('/info', (req, res) => {
  res.send(
    `
<div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
</div>
`)
})

app.get(baseUrl, (req, res) => {
  res.json(persons)
})

app.get(`${baseUrl}/:id`, (req, res) => {
  const id = parseInt(req.params.id)
  const person = persons.find(p => p.id === id)

  person
    ? res.json(person)
    : res.status(404).end()
})

app.delete(`${baseUrl}/:id`, (req, res) => {
  const id = parseInt(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

app.post(baseUrl, (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name and number cannot be empty'
    })
  }

  if (persons.find(p => p.name === body.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: Math.round(Math.random() * 100000),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  res.json(person)
})

app.use(unknownEndpoint)

const PORT = 3001 
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
