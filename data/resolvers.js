import mongoose from 'mongoose'
import { Clientes, Productos } from './db'
import { rejects } from 'assert';

export const resolvers = {
  Query: {
    getClientes: (root, {limite, offset})=>{
      return Clientes.find({}).limit(limite).skip(offset)
    },
    getCliente: (root, {id})=>{
      return new Promise((resolve, object)=>{
        Clientes.findById(id, (error, cliente) => {
          if(error) rejects(error)
          else resolve(cliente)
        })
      })
    },
    totalClientes: (root) => {
      return new Promise((resolve, object) => {
        Clientes.countDocuments({}, (error, count) => {
          if(error) rejects(error)
          else resolve(count)
        })
      })
    },
    getProductos: (root, {limite, offset})  =>{
      return Productos.find({}).limit(limite).skip(offset)
    },
    getProducto: (root, {id})=>{
      return new Promise((resolve, object) =>{
        Productos.findById(id, (error, producto) => {
          if(error) rejects(error)
          else resolve(producto)
        })
      })
    },
    totalProductos: (root) => {
      return new Promise((resolve, object) => {
        Productos.countDocuments({}, (error, count) => {
          if(error) rejects(error)
          else resolve(count)
        })
      })
    }
  },
  Mutation: {
    crearCliente : (root, {input}) => {
     const nuevoCliente = new Clientes({
        nombre : input.nombre,
        apellido : input.apellido,
        empresa : input.empresa,
        emails : input.emails,
        edad : input.edad,
        tipo : input.tipo,
        pedidos : input.pedidos
     })
     nuevoCliente.id = nuevoCliente._id

     return new Promise((resolve, object) => {
       nuevoCliente.save((error)=>{
          if(error) rejects(error)
          else resolve(nuevoCliente)
       })
     })
    },
    actualizarCliente: (root, {input})=> {
      return new Promise((resolve, object) => {
        Clientes.findOneAndUpdate({_id: input.id}, input, {new: true}, 
          (error, cliente)=>{
          if(error) rejects(error)
          else resolve(cliente)
        })
      })
    },
    eliminarCliente: (root, {id}) => {
      return new Promise((resolve, object)=>{
        Clientes.findOneAndRemove({_id: id}, (error) => {
          if(error) rejects(error)
          else resolve("Cliente eliminado de la base de datos")
        })
      })
    },
    nuevoProducto : (root, {input}) => {
      const nuevoProducto = new Productos({
         nombre : input.nombre,
         precio : input.precio,
         stock : input.stock,
      })
      nuevoProducto.id = nuevoProducto._id
 
      return new Promise((resolve, object) => {
        nuevoProducto.save((error)=>{
           if(error) rejects(error)
           else resolve(nuevoProducto)
        })
      })
     },
     actualizarProducto: (root, {input}) => {
       return new Promise((resolve, object) =>{
         Productos.findOneAndUpdate({_id: input.id}, input, {new: true}, (error, producto) => {
          if(error) rejects(error)
          else resolve(producto)
         })
       })
     },
     eliminarProducto: (root, {id}) => {
       return new Promise((resolve, object) => {
         Productos.findOneAndRemove({_id: id}, (error) => {
          if(error) rejects(error)
          else resolve("Producto eliminado de la base de datos")
         })
       })
     }
  }
}
