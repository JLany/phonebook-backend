const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
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
  number: {
    type: String,
    minLength: [8, 'the field \'number\' must be of length 8 or more'],
    validate: {
      validator: (value) => {
        const phoneNumberRegex = /^\d{2,3}-\d+$/
        return phoneNumberRegex.test(value)
      },
      message: 'number format is invalid. the field \'number\' should be in the form XXX-XXXXX.. or XX-XXXXXX...'
    }
  },
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
