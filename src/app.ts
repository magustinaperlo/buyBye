import { Model } from 'sequelize';
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { isStrongPassword } from './utils/passwordUtils';
import cors from 'cors';
import path from 'path';
import { sequelize, UserInstance } from './sequelize';
import fs from 'fs';
import multer, { Multer } from 'multer';

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

// Middleware para verificar el token en las solicitudes protegidas
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    // Extender el tipo de la solicitud para incluir la propiedad 'user'
    (req as any).user = decoded;

    next();
  });
};

// Uso del middleware en rutas protegidas
app.get('/ruta-protegida', verifyToken, (req: Request, res: Response) => {
  // Acceso a la información del usuario a través de req.user
  res.json({ user: (req as any).user });
});

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(upload.single('photo'));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Request body:', req.body);
  console.log('Request file:', (req as any).file); 
  next();
});

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


app.get('/index', (req, res) => renderPage(res, 'index.html'));
app.get('/home', (req, res) => renderPage(res, 'home.html'));

// Ruta para /login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para /register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


async function correoYaRegistrado(email: string): Promise<boolean> {
  try {
    const user = await sequelize.models.User.findOne({ where: { email } });
    return !!user;
  } catch (error) {
    console.error('Error al verificar el correo electrónico:', error);
    return false;
  }
}

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const correoEnUso = await correoYaRegistrado(email);

    if (correoEnUso) {
      return res.json({ success: false, message: 'Correo electrónico ya registrado' });
    }

    const { password, ...userData } = req.body;
    console.log('Contraseña recibida:', password);
 
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'La contraseña no cumple con los requisitos de seguridad' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const photoFile: Express.Multer.File | undefined = req.file;

    if (!photoFile) {
      return res.status(400).json({ error: 'Foto no proporcionada en el formulario' });
    }

    const photoFolderPath = path.join(__dirname, 'public', 'uploads');
    const photoFileName = photoFile ? photoFile.originalname : 'default.jpg';
    const photoFilePath = path.join(photoFolderPath, photoFileName);
    fs.writeFileSync(photoFilePath, photoFile.buffer);

    const photoPath = photoFile ? `/uploads/${photoFileName}` : '/uploads/default.jpg';

    // Crear el nuevo usuario con active: true
    await sequelize.models.User.create({
      ...userData,
      password: hashedPassword,
      active: true,
      photo: photoPath,
    });

    console.log('Valor final de active:', true);
    
    res.json({ success: true, message: 'Usuario registrado correctamente' });

  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: (error as Error).message });
  }
});

function isUserInstance(model: Model<any, any>): model is UserInstance {
  return 'comparePassword' in model;
}
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('Contraseña recibida en el backend:', password);
  try {
    const user: Model<any, any> | null = await sequelize.models.User.findOne({
      where: { email },
    });

    console.log('Usuario recuperado de la base de datos:', user);

 if (user && user instanceof sequelize.models.User && isUserInstance(user)) {
  console.log('previo a la comparacion');
  if (await user.comparePassword(password)) {
     const token = jwt.sign({ userId: user.user_id, email: user.email, photoPath: user.photoPath }, SECRET_KEY);
     return res.json({ message: 'Inicio de sesión exitoso', token });
  }
  
}
    return res.status(401).json({ error: 'Credenciales inválidas' });

  } catch (error) {
    console.error('Error al intentar iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});
function renderPage(res: Response, page: string) {
  res.sendFile(path.join(__dirname, 'public', page));
}
//añado
// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});