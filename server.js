const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const schema = buildSchema(`
    type RandomDie {
        rollOnce : Int!
        roll(numRolls: Int) : [Int]
    }

    type Query {
        getDie(numSides: Int) : RandomDie
    }
`)

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

const root = {
    getDie({ numSides }) {
        return new RandomDie(numSides)
    }
}

const app = express()
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}))

app.listen(4000)
console.log('Running GraphQl API server at localhost:4000/graphql')