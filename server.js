const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const schema = buildSchema(`

    input MessageInput {
        author: String
        content: String
    }

    type Message {
        id: String
        content: String
        author: String
    }

    type RandomDie {
        rollOnce : Int!
        roll(numRolls: Int) : [Int]
    }

    type Query {
        getMessage(id: ID) : Message
        getDie(numSides: Int) : RandomDie
    }

    type Mutation {
        createMessage(input: MessageInput) : Message
        updateMessage(id: Int!, input: MessageInput) : Message
    }
`)

let fakeDatabase = {}

class Message {
    constructor(id, { author, content }) {
        this.id = id
        this.author = author,
        this.content = content
    }
}


class RandomDie {
    rollOnce () {
        return 1 + Math.floor(Math.random() * this.numSides)
    }
    roll({ numRolls }) {
        let arr = [...Array(numRolls).keys()]
        return arr.map(i => this.rollOnce())
    }
    constructor(numSides) {
        this.numSides = numSides
    }
}

function loggingMiddleWare(req, res, next) {
    console.log('ip:' + req.ip)
    next()
}

const root = {
    ip(args, request) {
        return request.ip
    },
    getDie({ numSides }) {
        return new RandomDie(numSides)
    },
    getMessage({ id }) {
        console.log(id);
        
        if(!fakeDatabase[id]) {
            throw new Error(`no message with id of ${id} found`)
        }
        return new Message(id, fakeDatabase[id]);
    },
    createMessage({ input }) {
        const id = require('crypto').randomBytes(10).toString('hex')
        fakeDatabase[id] = input
        return new Message(id, fakeDatabase[id].author, fakeDatabase[id].content)
    },
    updateMessage({ id, input}) {
        if(!fakeDatabase[id]) {
            throw new Error(`no message with id of ${id} found`)
        }
        fakeDatabase[id] = input
        return new Message(id, fakeDatabase[id])
    }
}
const app = express()
app.use(loggingMiddleWare)
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}))

app.listen(4000)
console.log('Running GraphQl API server at localhost:4000/graphql')