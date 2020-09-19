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

morgan.token('dataOnPost', function (req, res) {
    if( req.method === 'POST') 
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
//----------------------

//creating a token and using it:
/*morgan.token('my-tiny', function (tokens, req, res) {
        return [        
            tokens.method(req,res),
            tokens.url(req,res),
            tokens.status(req,res),
            tokens.res(req,res, 'content-length'),
            '-',
            tokens['response-time'](req, res), 'ms',
            tokens.dataOnPost(req,res)    
        ].join(' ')
    
})
app.use(morgan('my-tiny'))*/
//------------------------------

//using a string of pre-define tokens
//app.use(morgan(':method :url :status :res[content-length] - :response-time ms :dataOnPost'))
//--------------------------------------


let persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }

]

app.get('/api/persons', (req, res) => {
    Person.find({}).then(result=>{
        res.json(result)
    })
})

app.get('/info', (req, res) => {

    res.send(
        `<p>
            Phonebook has info for ${persons.length} people
        </p>
        <p>
            ${new Date}
        </p>`
    )
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)

    const person_requested = persons.find((person) => person.id === id)

    if (person_requested) {
        res.json(person_requested)
    }
    else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)

    persons = persons.filter((person) => person.id !== id)
    res.status(204).end()
})

const generateNewId = () => {
    return Math.floor(Math.random() * 999999999999)
}

app.post('/api/persons/', (req, res) => {
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
    })
})


const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is runnning on port ${PORT}`))