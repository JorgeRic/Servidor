import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './data/schema'
import { resolvers } from './data/resolvers'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config({path: 'variables.env'})

const app = express()

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  context: async({req}) => {
    const token = req.headers['authorization']
    console.log(token, 'hpla')
    if(token!== "null"){
      try{
        const usuarioActual = await jwt.verify(token, process.env.SECRETO)
        req.usuarioActual = usuarioActual
        console.log(req.usuarioActual)
        return {
          usuarioActual
        };
      }catch(error){
        console.log(error)
      }
    }
  }
})

server.applyMiddleware({app})

app.listen({port: 4000}, ()=> console.log(`El servidor funciona http://localhost:4000${server.graphqlPath}`))