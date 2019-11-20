
//Permite importar lo que esta en el archivo schema.graphql
import { importSchema } from 'graphql-import'
//importamos los types
const typeDefs = importSchema('data/schema.graphql')



export {typeDefs}