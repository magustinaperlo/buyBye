"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
class User extends sequelize_1.Model {
}
exports.User = User;
const sequelize = new sequelize_1.Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '123456789',
    database: 'challenge_buybye',
});
exports.sequelize = sequelize;
User.init({
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cpf: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    birthdate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    photo: {
        type: sequelize_1.DataTypes.STRING, // Cambiado de BLOB a STRING
        allowNull: false,
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        set(value) {
            const hashedPassword = bcrypt_1.default.hashSync(value, 10);
            this.setDataValue('password', hashedPassword);
        },
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
});
console.log('Modelo de usuario inicializado:', User === sequelize.models.User);
/*
User.prototype.comparePassword = function(this: UserInstance, candidatePassword: string) {
  //return bcrypt.compareSync(candidatePassword, this.password);
  const isMatch = bcrypt.compareSync(candidatePassword, this.password);
  console.log('Resultado de bcrypt.compareSync:', bcrypt.compareSync(candidatePassword, this.password));
  console.log('Contraseña almacenada en la base de datos:', this.password);
  console.log('Contraseña ingresada por el usuario:', candidatePassword);
  console.log('Comparación de contraseña:', isMatch);
  return isMatch;

}; */
/* User.prototype.comparePassword = function(this: UserInstance, candidatePassword: string) {
  try {
    const isMatch = bcrypt.compareSync(candidatePassword, this.password);
    console.log('Contraseña almacenada en la base de datos:', this.password);
    console.log('Contraseña ingresada por el usuario:', candidatePassword);
    console.log('Comparación de contraseña:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    return false;
  }
}; */
User.prototype.comparePassword = function (candidatePassword) {
    try {
        const isMatch = bcrypt_1.default.compareSync(candidatePassword, this.password);
        console.log('Contraseña ingresada por el usuario (hasheada):', bcrypt_1.default.hashSync(candidatePassword, 10));
        console.log('Contraseña almacenada en la base de datos (hasheada):', this.password);
        console.log('Comparación de contraseñas:', isMatch);
        return isMatch;
    }
    catch (error) {
        console.error('Error al comparar contraseñas:', error);
        return false;
    }
};
