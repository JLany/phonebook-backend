const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB successfully')
  })
  .catch(error => {
    console.log('an error occurred while connecting to MongoDB:', error.message)
    process.exit(1)
  })

const personSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'the field \'name\' is required'],
    minLength: [3, 'the field \'name\' must be at least 3 charcters long'],
    unique: true
  },
  number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person
