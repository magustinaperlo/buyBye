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
const sequelize_1 = require("./sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 12000;
const SECRET_KEY = '31feedaf16319e72fb49ff351b4ad1d2d2fac58b5cbba8d0f913a79df8472f3a';
const SALT_ROUNDS = 10;
app.use(body_parser_1.default.json());
// Ruta de registro de usuario
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { password } = _a, userData = __rest(_a, ["password"]);
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        const newUser = yield sequelize_1.User.create(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
        res.json(newUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
}));
// Ruta de inicio de sesión
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield sequelize_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (isPasswordMatch) {
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '168h' });
            const response = {
                token,
                userId: user.id,
                email: user.email,
            };
            return res.json(response);
        }
        else {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}));
// Ruta de registro
app.get('/register', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'register.html'));
});
// Ruta de inicio de sesión (login)
app.get('/login', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'login.html'));
});
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});