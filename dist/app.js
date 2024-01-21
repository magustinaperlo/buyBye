"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const passwordUtils_1 = require("./utils/passwordUtils");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("./sequelize");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
sequelize_1.sequelize
    .authenticate()
    .then(() => {
    console.log('Conexión a la base de datos establecida correctamente');
})
    .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
});
const app = (0, express_1.default)();
const PORT = 4000;
const SECRET_KEY = '31feedaf16319e72fb49ff351b4ad1d2d2fac58b5cbba8d0f913a79df8472f3a';
const SALT_ROUNDS = 10;
app.use(body_parser_1.default.json());
app.use(express_1.default.static('public'));
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Configuración de multer
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
app.use(upload.single('photo'));
app.use((req, res, next) => {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
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
app.get('/test-database', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield sequelize_1.sequelize.query('SELECT 1+1 as result');
        res.json({ message: 'Conexión a la base de datos exitosa', result });
    }
    catch (error) {
        console.error('Error en la prueba de conexión a la base de datos:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
}));
app.get('/index', (req, res) => renderPage(res, 'index.html'));
app.get('/home', (req, res) => renderPage(res, 'home.html'));
// Ruta para /login
app.get('/login', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'login.html'));
});
// Ruta para /register
app.get('/register', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'register.html'));
});
//10-01
function correoYaRegistrado(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Lógica para consultar la base de datos y verificar si el correo ya está registrado
            const user = yield sequelize_1.sequelize.models.User.findOne({ where: { email } });
            // Devolver true si el correo está registrado, false si no está registrado
            return !!user;
        }
        catch (error) {
            console.error('Error al verificar el correo electrónico:', error);
            return false;
        }
    });
}
//comento lo de abajo porque no funciona 11-01 
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const correoEnUso = yield correoYaRegistrado(email);
        if (correoEnUso) {
            return res.json({ success: false, message: 'Correo electrónico ya registrado' });
        }
        const _a = req.body, { password } = _a, userData = __rest(_a, ["password"]);
        console.log('Contraseña recibida:', password);
        if (!(0, passwordUtils_1.isStrongPassword)(password)) {
            return res.status(400).json({ error: 'La contraseña no cumple con los requisitos de seguridad' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        const photoFile = req.file;
        if (!photoFile) {
            return res.status(400).json({ error: 'Foto no proporcionada en el formulario' });
        }
        const photoFolderPath = path_1.default.join(__dirname, 'public', 'uploads');
        const photoFileName = photoFile ? photoFile.originalname : 'default.jpg';
        const photoFilePath = path_1.default.join(photoFolderPath, photoFileName);
        fs_1.default.writeFileSync(photoFilePath, photoFile.buffer);
        const photoPath = photoFile ? `/uploads/${photoFileName}` : '/uploads/default.jpg';
        // Crear el nuevo usuario con active: true
        yield sequelize_1.sequelize.models.User.create(Object.assign(Object.assign({}, userData), { password: hashedPassword, active: true, photo: photoPath }));
        console.log('Valor final de active:', true);
        // Solo enviar la respuesta después de todas las operaciones
        res.json({ success: true, message: 'Usuario registrado correctamente' });
    }
    catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
}));
/* app.post('/login', async (req: Request, res: Response) => {
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
 */
// function comparePassword(this: any, candidatePassword: string): boolean {
//   return bcrypt.compareSync(candidatePassword, this.password);
// }
//comente arriba para probar el hasheo de clave abajo
/* app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: Model<any, any> | null = await sequelize.models.User.findOne({
      where: { email },
    });

    // if (user && user instanceof sequelize.models.User && isUserInstance(user)) {
    //   if (user.comparePassword(password)) {
    //     const token = jwt.sign({ userId: user.user_id }, SECRET_KEY);
    //     return res.json({ message: 'Inicio de sesión exitoso', token });
    //   }
    //   else {
    //     return res.status(401).json({ error: 'Contraseña incorrecta' });
    //   }
    // } else {
    //   return res.status(401).json({ error: 'Usuario no encontrado' });
    // }
    if (user && user instanceof sequelize.models.User && isUserInstance(user)) {
      // if (user.comparePassword(password)) {
      //   const token = jwt.sign({ userId: user.user_id }, SECRET_KEY);
        
      //   return res.json({ message: 'Inicio de sesión exitoso', token });
      // }
      console.log('Antes de comparePassword');
    if (await user.comparePassword(password)) {
      console.log('Después de comparePassword: Contraseña correcta');
      const token = jwt.sign({ userId: user.user_id }, SECRET_KEY);
      return res.json({ message: 'Inicio de sesión exitoso', token });
    } else {
      console.log('Después de comparePassword: Contraseña incorrecta');
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

      // if (await user.comparePassword(password)) {
      //   const token = jwt.sign({ userId: user.user_id }, SECRET_KEY);
      //   return res.json({ message: 'Inicio de sesión exitoso', token });
      // }
    }
    return res.status(401).json({ error: 'Credenciales inválidas' });

  } catch (error) {
    console.error('Error al intentar iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}); */
// app.post('/login', async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   try {
//     const user: Model<any, any> | null = await sequelize.models.User.findOne({
//       where: { email },
//     });
//     if (user && user instanceof sequelize.models.User && isUserInstance(user)) {
//       // Mostrar el resultado del hasheo de la contraseña ingresada por el usuario
//       const hashedPassword = bcrypt.hashSync(password, 10);
//       console.log('Contraseña ingresada por el usuario (hasheada):', hashedPassword);
//       // Compara la contraseña ingresada por el usuario con la almacenada en la base de datos
//       if (user.comparePassword(password)) {
//         const token = jwt.sign({ userId: user.user_id }, SECRET_KEY);
//         console.log('contraseña hasheada en bdd: ', user.password);
//         return res.json({ message: 'Inicio de sesión exitoso', token });
//       }
//     }
//     return res.status(401).json({ error: 'Credenciales inválidas' });
//   } catch (error) {
//     console.error('Error al intentar iniciar sesión:', error);
//     return res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield sequelize_1.sequelize.models.User.findOne({
            where: { email },
        });
        console.log('Usuario recuperado de la base de datos:', user);
        if (user && user instanceof sequelize_1.sequelize.models.User && isUserInstance(user)) {
            // Comparar el hash de la contraseña ingresada por el usuario con el hash almacenado en la base de datos
            console.log('previo a la comparacion');
            if (bcrypt_1.default.compareSync(password, user.password)) {
                const token = jsonwebtoken_1.default.sign({ userId: user.user_id }, SECRET_KEY);
                console.log('Contraseña ingresada por el usuario (hasheada):', password);
                console.log('Contraseña bdd (hasheada):', user.password);
                return res.json({ message: 'Inicio de sesión exitoso', token });
            }
        }
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
function isUserInstance(model) {
    return 'comparePassword' in model;
}
function renderPage(res, page) {
    res.sendFile(path_1.default.join(__dirname, 'public', page));
}
//añado
// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});
