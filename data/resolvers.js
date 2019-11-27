import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId;
import { Clientes, Productos, Pedidos, Usuarios } from './db'
import { rejects } from 'assert';
import bcrypt from 'bcrypt'

import dotenv from 'dotenv';
dotenv.config({path: 'variables.env'})
import jwt from 'jsonwebtoken';


const crearToken = (usuarioLogin, secreto, expiresIn) => {
  const {usuario} = usuarioLogin;
  return jwt.sign({usuario}, secreto, {expiresIn})
    
}

export const resolvers = {
  Query: {
    getClientes: (root, {limite, offset, vendedor})=>{
      let filtro;
      if(vendedor){
        filtro = {vendedor : new ObjectId(vendedor)}
      }
      return Clientes.find(filtro).limit(limite).skip(offset)
    },
    getCliente: (root, {id})=>{
      return new Promise((resolve, object)=>{
        Clientes.findById(id, (error, cliente) => {
          if(error) rejects(error)
          else resolve(cliente)
        })
      })
    },
    totalClientes: (root, {vendedor}) => {
      return new Promise((resolve, object) => {
        let filtro;
        if(vendedor){
        filtro = {vendedor : new ObjectId(vendedor)}
      }
        Clientes.countDocuments(filtro, (error, count) => {
          if(error) rejects(error)
          else resolve(count)
        })
      })
    },
    getProductos: (root, {limite, offset, stock})  =>{
      //tilizamos $gt para que nos devuelva los elementos igual o mayores a un valor
      let filtro;
      if(stock){
        filtro = { stock: {$gt: 0} }
      }
      return Productos.find(filtro).limit(limite).skip(offset)
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
    },
    //Lo relacionamos con el cliente
    //No nos trae todos lod pedidos. Solo los pedidos de un cliente
    obtenerPedidos:(root, {cliente}) => {
      return new Promise((resolve, object) => {
        Pedidos.find({cliente: cliente}, (error, pedido) => {
          if(error) rejects(error)
          else resolve(pedido)
        })
      })
    },
    //Relacionar una tabla con otra
    topClientes: (root) => {
       return new Promise((resolve, object) => {
        Pedidos.aggregate([
          //Se utiliza siempre con el aggregate
          //Realiza una busqueda y nos devuelve solo los que cumplan la condicion
            {
              $match: {estado: "COMPLETADO"}
            },
            {
              //Permite sumar los totales
              $group: {
                _id: "$cliente",
                total: {$sum: "$total"}
              }
            },
            {
              //$lookup Es como un join. Permite relacionar dos tablas
              //En este caso pedidos con clientes
              $lookup: {
                  from: "clientes",
                  localField: "_id",
                  foreignField: "_id",
                  as: "cliente"
              }
            },
            //Ordena de mayor a menor
            {
              $sort: {total: -1}
            },
            //creamos un limite de datos a traernos
            {
              $limit: 10
            }         
        ], (error, resultado) => {
          if(error) rejects(error)
          else resolve(resultado)
        })
      })
    },
    obtenerUsuario: (root, args, {usuarioActual})=> {
      if(!usuarioActual){
        return null
      }
      // console.log(usuarioActual)
      //Obetener el usuario actual del req
      const usuario = Usuarios.findOne({usuario: usuarioActual.usuario})
      return usuario
    },
    topVendedores: (root) => {
      return new Promise((resolve, object) => {
       Pedidos.aggregate([
         //Se utiliza siempre con el aggregate
         //Realiza una busqueda y nos devuelve solo los que cumplan la condicion
           {
             $match: {estado: "COMPLETADO"}
           },
           {
             //Permite sumar los totales
             $group: {
               _id: "$vendedor",
               total: {$sum: "$total"}
             }
           },
           {
             //$lookup Es como un join. Permite relacionar dos tablas
             //En este caso pedidos con usuarios
             $lookup: {
                 from: "usuarios",
                 localField: "_id",
                 foreignField: "_id",
                 as: "vendedor"
             }
           },
           //Ordena de mayor a menor
           {
             $sort: {total: -1}
           },
           //creamos un limite de datos a traernos
           {
             $limit: 10
           }         
       ], (error, resultado) => {
         if(error) rejects(error)
         else resolve(resultado)
       })
     })
   },
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
        pedidos : input.pedidos,
        vendedor: input.vendedor
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
     },
     nuevoPedido : (root, {input}) =>{
      const nuevoPedido = new Pedidos({
        pedido: input.pedido,
        total: input.total,
        fecha: new Date(),
        cliente: input.cliente,
        estado: "PENDIENTE",
        vendedor: input.vendedor
      })
      nuevoPedido.id = nuevoPedido._id
      return new Promise((resolve, object) => {
        nuevoPedido.save((error) => {
          if(error) rejects(error)
          else resolve(nuevoPedido)
        })
      })
     },
     actualizarEstado : (root, {input}) => {
     return new Promise((resolve, object) => {
      const {estado} = input
      let instruccion;
      if(estado === 'COMPLETADO'){
        instruccion = '-'
      }else if(estado === 'CANCELADO'){
        instruccion = '+'
      }
        input.pedido.forEach(pedido => {
          Productos.updateOne({_id : pedido.id},
            //$inc es un metodo de mongo para ampliaro reducir cantidades
            { "$inc" : 
              {"stock" : `${instruccion}${pedido.cantidad}`}
            }, function (error){
            if (error) return new Error(error)
          })
        })
        Pedidos.findOneAndUpdate({_id: input.id}, input, {new: true}, (error, producto)=>{
          if(error) rejects(error)
          else resolve("Actualizado correctamente")
        })
     })
    },
    crearUsuario: async(root, {usuario, nombre, password, rol})=> {
      const existeUsuario = await Usuarios.findOne({usuario})
      if(existeUsuario){
        throw new Error('El usuario ya existe')
      }
      const nuevoUsuario = await new Usuarios({
        usuario,
        nombre,
        password,
        rol
      }).save()
      return "Creado correctamente"
    },
    autentificarUsuario: async(root, {usuario, password}) => {
      const nombreUsuario = await Usuarios.findOne({usuario})
      if(!nombreUsuario) {
        throw new Error('El usuario no existe')
      }
      const passwordCorrecto = await bcrypt.compare(password, nombreUsuario.password)
      if(!passwordCorrecto){
        throw new Error('Password Incorrecto')
      }
      return{
        token: crearToken(nombreUsuario, process.env.SECRETO, '1hr')
      }
    }
    }
  }
