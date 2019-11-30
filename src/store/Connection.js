const mongoose = require('mongoose');

const openConnection = () => mongoose.connect(process.env.MONGO_CONNECTION, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
     useCreateIndex: true }
);

module.exports = {
    openConnection,
}