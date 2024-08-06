const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('enter password as an argument')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://kilanydev:${password}@cluster0.bxxbhnx.mongodb.net/devphonebookapp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
    getAll()
}
else {
    const [name, number] = [process.argv[3], process.argv[4]]
    create(name, number)
}

function create(name, phone) {
    const person = new Person({
        name: name,
        number: phone
    })

    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)

        mongoose.connection.close()
    })
}

function getAll() {
    Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach(person =>
            console.log(`${person.name} ${person.number}`)
        )

        mongoose.connection.close()
    })
}
    