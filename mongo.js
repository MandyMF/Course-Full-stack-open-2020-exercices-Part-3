const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument')
    process.exit(1)
}

if (process.argv.length > 5) {
    console.log('To many arguments, use "" if the name contains empty space')
    process.exit(1)
}

const password = process.argv[2]
const database_name = 'phonebook-app'

const url =
    `mongodb+srv://fullstack:${password}@cluster0.vqjhh.mongodb.net/${database_name}?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser:true, useUnifiedTopology:true })

const personSchema = new mongoose.Schema(
    {
        name: String,
        number: String,
    }
)

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5)
{
    const contact = new Person(
        {
            name: process.argv[3],
            number: process.argv[4],
        }
    )

    contact.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
    })
}

if (process.argv.length === 3)
{
    Person.find({}).then(persons =>
        {
            console.log('phonebook:')
            
            persons.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })

            mongoose.connection.close()
        }
    )
}
