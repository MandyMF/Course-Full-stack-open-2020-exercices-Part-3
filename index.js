const express = require('express')
const app = express()
const morgan = require('morgan')

//middleware
app.use(express.json())

//all work, pick your poison
//app.use(morgan('tiny'))
//app.use(morgan(':method :url :status :res[content-length] :response-time ms'))

//using a function

app.use(morgan (function(tokens, req, res){
    return [
        tokens.method(req,res),
        tokens.url(req,res),
        tokens.status(req,res),
        tokens.res(req,res, 'content-length'),
        '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
}))

//creating a token and using it:
/*morgan.token('my-tiny', function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')}
)
app.use(morgan('my-tiny'))*/
//------------------------------



let persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }

]

app.get('/api/persons', (req, res) => {

    res.json(persons)
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
    if (persons.find(person => person.name === body.name)) {
        return res.status(409).json({
            error: 'name must be unique'
        })
    }

    const new_person =
    {
        name: body.name,
        number: body.number,
        id: generateNewId()
    }

    persons = persons.concat(new_person)

    res.json(new_person)
})


const PORT = 3001
app.listen(PORT, () => console.log(`Server is runnning on port ${PORT}`))