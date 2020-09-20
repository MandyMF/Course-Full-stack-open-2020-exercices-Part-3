const express = require('express')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()
const morgan = require('morgan')

//middleware
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('dataOnPost', function (req) {
  if (req.method === 'POST')
    return JSON.stringify(req.body)
  return null
})

//all work, pick your poison
//using a function
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res), 'ms',
    tokens.dataOnPost(req, res)
  ].join(' ')
}))

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.get('/info', (req, res) => {

  Person.find({}).then(persons => {
    res.send(
      `<p>
                Phonebook has info for ${persons.length} people
            </p>
            <p>
                ${new Date}
            </p>`
    )
  })


})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id

  Person.findById(id).then(person_requested => {

    if (person_requested) {
      res.json(person_requested)
    }
    else {
      res.status(404).end()
    }
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    }).catch(error => next(error))
})

app.post('/api/persons/', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'body and name are needed'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(result => {
    res.json(result)
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted if' })
  }
  if (error.name === 'ValidationError' && error.errors.name && error.errors.name.properties.type === 'unique') {
    return response.status(403).send({ error: 'Persons with the same names are not allowed in the phonebook' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is runnning on port ${PORT}`))