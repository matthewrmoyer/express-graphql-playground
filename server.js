const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

const schema = buildSchema(`
    type Query {
        hello : String
        quoteOfTheDay : String,
        random : Float,
        rollThreeDice : [Int]
        rollNumDice(numDice: Int!)  : [Int]
    }
`)

const root = {
    hello() {
        return 'Hello World'
    },
    quoteOfTheDay() {
        return Math.random()  < .5 ? 'Take it Easy' : 'Work Hard Today'
    },
    random() {
        return Math.random()
    },
    rollThreeDice() {
        return [1, 2, 3].map( x => 1 + Math.floor(Math.random() * 6))
    },
    rollNumDice({ numDice }) {
        let arr = [...Array(numDice).keys()]
        let data = arr.map(x => 1 + Math.floor(Math.random() * 6))
        return data
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