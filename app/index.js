const mongoose = require('mongoose')
const {startBot} = require('./bot')

class Application {
    constructor(){
        this.configApp()
        this.setUpMongo()
        startBot()
    }
    configApp(){
        require('dotenv').config()
    }

    async setUpMongo(){
        console.log('test')
        await mongoose.connect('mongodb://localhost:27017/uploadNet').then(()=>{
            console.log('MongoDB Connected')
        }).catch(err=>{
            console.log('Error to connect to mongo uploaderNet Bot Database',err)
        })
    }
}

module.exports = Application
