const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    id:{
        type: Number,
        unique: true,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
        selected: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    systemUser: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

const User = mongoose.model('User', userSchema)
module.exports = User
