require('dotenv').config()

const Person = require('./models/person')

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

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

// configure logging with morgan
morgan.token('body', (request) => {
  return request.method === 'POST'
    ? JSON.stringify(request.body)
    : ''
})

// app.use(morgan('tiny'))
app.use(morgan((tokens, request, response) => {
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.req(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    tokens.body(request, response),
  ].join(' ')
}))

app.use(requestLogger)


// let persons = [
//   {
//     name: 'Arto Hellas',
//     number: '040-123456',
//     id: 1
//   },
//   {
//     name: 'Ada Lovelace',
//     number: '39-44-5323523',
//     id: 2
//   },
//   {
//     name: 'Dan Abramov',
//     number: '01013657064',
//     id: 3
//   }
// ]

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    console.log(persons)

    response.send(
      `
<div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
</div>
`)
  })
})

app.get(baseUrl, (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get(`${baseUrl}/:id`, (request, response, next) => {
  const id = request.params.id

  Person.findById(id)
    .then(person => {
      person
        ? response.json(person)
        : response.status(404).end()
    })
    .catch(error => next(error))
})

app.delete(`${baseUrl}/:id`, (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id).then(result => {
    console.log(result)
    response.status(204).end()
  })
    .catch(error => next(error))
})

app.post(baseUrl, (request, response, next) => {

  const { name, number } = request.body

  const person = new Person({
    name: name,
    number: number
  })

  person.save()
    .then(savedPerson => {
      response.status(201).json(savedPerson)
    })
    .catch(error => next(error))

  // Person
  //   .find({ name: body.name })
  //   .then(person => {
  //     const newPerson = new Person({
  //       name: body.name,
  //       number: body.number,
  //     })
  //     person
  //       ? newPerson.save().then(savedPerson => {
  //         response.json(savedPerson)
  //       })
  //       : response.status(400).json({
  //         error: 'name must be unique'
  //       })
  //   })
})

app.put(`${baseUrl}/:id`, (request, response, next) => {
  const id = request.params.id
  const { name, number } = request.body

  const person = {
    name: name,
    number: number,
  }

  Person
    .findByIdAndUpdate(
      id, person,
      {
        new: true, // configures the returned object in the callback to be the updated object
        runValidators: true,
        context: 'query'
      }
    )
    .then(updatedPerson => {
      console.log(updatedPerson)
      response.status(201).json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
