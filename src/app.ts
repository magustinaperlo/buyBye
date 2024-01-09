import { Model } from 'sequelize';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { isStrongPassword } from './utils/passwordUtils';
import cors from 'cors';
import path from 'path';
import { sequelize, UserInstance } from './sequelize';
import fs from 'fs';


sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente');
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });

const app = express();
const PORT = 4000;
const SECRET_KEY = '31feedaf16319e72fb49ff351b4ad1d2d2fac58b5cbba8d0f913a79df8472f3a';
const SALT_ROUNDS = 10;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para /home
app.get('/index', (req, res) => {
  res.send('¡Bienvenido a la página de inicio!');
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});



app.get('/test-database', async (req, res) => {
  try {
    const result = await sequelize.query('SELECT 1+1 as result');
    res.json({ message: 'Conexión a la base de datos exitosa', result });
  } catch (error) {
    console.error('Error en la prueba de conexión a la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: (error as Error).message });
  }
});

// comento ahora : app.get('/login', (req, res) => renderPage(res, 'login.html'));
// idem arriba app.get('/register', (req, res) => renderPage(res, 'register.html'));
//app.get('/', (req, res) => res.redirect('/index'));
app.get('/index', (req, res) => renderPage(res, 'index.html'));
app.get('/home', (req, res) => renderPage(res, 'home.html'));

// Ruta para /login
app.get('/login', (req, res) => {
  // Procesar lógica si es necesario
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para /register
app.get('/register', (req, res) => {
  // Procesar lógica si es necesario
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});



 app.post('/register', async (req: Request, res: Response) => {
  try {
    const { password, ...userData } = req.body;
    console.log('Contraseña recibida:', password);

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'La contraseña no cumple con los requisitos de seguridad' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    // Procesar el campo de la foto
    const photoFile: Express.Multer.File | undefined = req.file;

    if (!photoFile) {
      return res.status(400).json({ error: 'Foto no proporcionada en el formulario' });
    }

    const photoPath = `/uploads/${photoFile.filename}`;

    // Almacena la foto en algún lugar accesible en tu servidor (puede requerir configuración adicional)
    fs.writeFileSync(path.join(__dirname, 'public', 'uploads', photoFile.filename), photoFile.buffer);


    const newUser = await sequelize.models.User.create({
      ...userData,
      password: hashedPassword,
      photo: photoPath,
    });

    res.redirect('/home');
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: (error as Error).message });
  }
}); 

//comento lo de abajo porque no funciona 05-01 

/* app.post('/register', async (req: Request, res: Response) => {
  try {
    const { password, ...userData } = req.body;
    console.log('Contraseña recibida:', password);

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'La contraseña no cumple con los requisitos de seguridad' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await sequelize.models.User.create({
      ...userData,
      password: hashedPassword,
    });

    // Redirección con el código 303
    res.redirect(303, '/home');
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: (error as Error).message });
  }
}); */



app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: Model<any, any> | null = await sequelize.models.User.findOne({
      where: { email },
    });

    if (user && user instanceof sequelize.models.User && isUserInstance(user)) {
      if (user.comparePassword(password)) {
        const token = jwt.sign({ userId: user.user_id }, SECRET_KEY);
        return res.json({ message: 'Inicio de sesión exitoso', token });
      }
    }

    return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (error) {
    console.error('Error al intentar iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

function isUserInstance(model: Model<any, any>): model is UserInstance {
  return 'comparePassword' in model;
}

// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en el puerto ${PORT}`);
// });

function renderPage(res: Response, page: string) {
  res.sendFile(path.join(__dirname, 'public', page));
}


//añado
// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});














// /* import { Model, Op } from 'sequelize';
// import express, { Request, Response } from 'express';
// import bodyParser from 'body-parser';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
// import { isStrongPassword } from './utils/passwordUtils';
// import cors from 'cors';
// import path from 'path'; // Importa el módulo 'path'
// //import { sequelize, User } from './sequelize';  // Ajusta la ruta según la ubicación de tu archivo sequelize.ts
// import { sequelize, UserInstance } from './sequelize'; // Importación relativa desde la misma carpeta

// // prueba connect bdd
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Conexión a la base de datos establecida correctamente');
//   })
//   .catch((error) => {
//     console.error('Error al conectar con la base de datos:', error);
//   });


//  // Define la interfaz UserInstance directamente en app.ts
// interface UserInstance extends User {
//   comparePassword(candidatePassword: string): boolean;
// }

// const app = express();
// const PORT = 3000;
// const SECRET_KEY = '31feedaf16319e72fb49ff351b4ad1d2d2fac58b5cbba8d0f913a79df8472f3a';
// const SALT_ROUNDS = 10;

// app.use(bodyParser.json());
// app.use(express.static('public'));
// app.use(cors());
// // Middleware para servir archivos estáticos desde la carpeta 'public'
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/test-database', async (req, res) => {
//   try {
//     const result = await sequelize.query('SELECT 1+1 as result');
//     res.json({ message: 'Conexión a la base de datos exitosa', result });
//   } catch (error) {
//     console.error('Error en la prueba de conexión a la base de datos:', error);
//     res.status(500).json({ error: 'Error interno del servidor', details: (error as Error).message });
//   }
// });

// // Rutas GET para mostrar los archivos HTML
// app.get('/login', (req, res) => renderPage(res, 'login.html'));
// app.get('/register', (req, res) => renderPage(res, 'register.html'));
// app.get('/', (req, res) => res.redirect('/index'));
// app.get('/index', (req, res) => renderPage(res, 'index.html'));
// app.get('/home', (req, res) => renderPage(res, 'home.html'));

// app.post('/register', async (req: Request, res: Response) => {
//   try {
//     const { password, ...userData } = req.body;
//     console.log('Contraseña recibida:', password);

//     // Validar la contraseña
//     if (!isStrongPassword(password)) {
//       return res.status(400).json({ error: 'La contraseña no cumple con los requisitos de seguridad' });
//     }

//     const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

//     // Almacena la información del usuario en la base de datos
//     const newUser = await sequelize.models.User.create({
//       ...userData,
//       password: hashedPassword,
//     });

//     // Redirige al usuario a la página home después del registro exitoso
//     res.redirect('/home');
//   } catch (error) {
//     console.error('Error al registrar el usuario:', error);
//     res.status(500).json({ error: 'Error interno del servidor', details: (error as Error).message });
//   }
// });


// app.post('/login', async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     // Busca el usuario por su correo electrónico
//     const user: Model<any, any> | null = await sequelize.models.User.findOne({
//       where: { email },
//     });

//     // Verifica si el usuario existe y si la contraseña coincide
//     if (user && isUserInstance(user) && user.comparePassword(password)) {
//       // Aquí puedes generar un token JWT si lo necesitas
//       // const token = jwt.sign({ userId: user.id }, SECRET_KEY);

//       // Puedes enviar una respuesta exitosa o el token JWT, según tus necesidades
//       return res.json({ message: 'Inicio de sesión exitoso' });
//     } else {
//       // Si el usuario no existe o la contraseña no coincide, devuelve un mensaje de error
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     }
//   } catch (error) {
//     console.error('Error al intentar iniciar sesión:', error);
//     return res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });

// // Función de verificación de tipo para UserInstance
// function isUserInstance(model: Model<any, any>): model is UserInstance {
//   return 'comparePassword' in model;
// }



// /* // Ruta para el inicio de sesión
// app.post('/login', async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Busca el usuario en la base de datos por dirección de correo electrónico
//     const user = await sequelize.models.User.findOne({
//       where: {
//         email: {
//           [Op.eq]: email,
//         },
//       },
//     });

//     const userInstance = user as UserInstance;

//     if (userInstance && userInstance.comparePassword(password)) {
//       // Aquí puedes generar un token JWT si lo necesitas
//       const token = jwt.sign({ userId: userInstance.id }, SECRET_KEY);
//       return res.json({ message: 'Inicio de sesión exitoso', token });
//     } else {
//       // Si el usuario no existe o la contraseña no coincide, devuelve un mensaje de error
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     } */




//     /* // Verifica si el usuario existe y si la contraseña coincide
//     const userInstance = user as User;
//     if (user && (user as UserInstance).comparePassword(password)) {
//       // Aquí puedes generar un token JWT si lo necesitas
//       const token = jwt.sign({ userId: (user as UserInstance).id }, SECRET_KEY);
    

//       // Puedes enviar una respuesta exitosa o el token JWT, según tus necesidades
//       return res.json({ message: 'Inicio de sesión exitoso' });
//     } else {
//       // Si el usuario no existe o la contraseña no coincide, devuelve un mensaje de error
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     } 
    
//   } catch (error) {
//     console.error('Error al iniciar sesión:', error);
//     res.status(500).json({ error: 'Error interno del servidor', details: (error as Error).message });
//   }
// });*/


// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en el puerto ${PORT}`);
// });

// // Función para renderizar páginas HTML
// function renderPage(res: Response, page: string) {
//   res.sendFile(path.join(__dirname, 'public', page));
// }
//  */