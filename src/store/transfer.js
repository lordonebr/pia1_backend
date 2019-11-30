const mongoose = require('mongoose')

const transferSchema = new mongoose.Schema({
    idSender:{
        type: Number,
        require: true
    },
    idRecipient:{
        type: Number,
        require: true
    },
    credit: {
        type: Number
    },
    donation: {
        type: Number
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Transfer = mongoose.model('Transfer', transferSchema)
module.exports = Transfer
