const mongoose = require('mongoose')

const awardSchema = new mongoose.Schema({
    id:{
        type: Number,
        unique: true,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    cost: {
        type: Number
    }
})

const Award = mongoose.model('Award', awardSchema)
module.exports = Award
