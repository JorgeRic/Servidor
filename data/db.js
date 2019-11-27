import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/clientes', {
  // keepAlive: true,
  useNewUrlParser: true,
  // reconnectTries: Number.MAX_VALUE
});

const clientesSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  empresa: String,
  emails: Array,
  edad: Number,
  tipo: String,
  pedidos: Array
  // totalClientes: String
});
const Clientes = mongoose.model('clientes', clientesSchema);

const productosSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  stock: Number
})
const Productos = mongoose.model('productos', productosSchema)

const pedidosSchema = new mongoose.Schema({
  pedido: Array,
  total: Number,
  fecha: Date,
  //con mongoose.Types.ObjectId almacenamos como id
  cliente: mongoose.Types.ObjectId,
  estado: String
})
const Pedidos = mongoose.model('pedidos', pedidosSchema)

//Usuarios
const usuariosSchema = new mongoose.Schema({
  usuario: String,
  nombre: String,
  password: String,
  rol: String
  
})
//hasehar los passwords
usuariosSchema.pre('save', function(next){
  if(!this.isModified('password')){
    return next()
  }
  bcrypt.genSalt(10, (error, salt) => {
    if(error) return next(error)
    bcrypt.hash(this.password, salt, (error, hash) => {
      if(error) return next(error)
      this.password = hash
      next()
    })
  })
})
const Usuarios = mongoose.model ('usuarios', usuariosSchema)

export { Clientes, Productos, Pedidos , Usuarios}

