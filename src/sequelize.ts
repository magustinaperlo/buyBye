import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';

interface UserAttributes {
  user_id: number;
  name: string;
  cpf: string;
  birthdate: Date;
  phone_number: string;
  photo: string;
  state: string;
  city: string;
  active: boolean;
  email: string;
  password: string;
}

interface UserCreationAttributes extends UserAttributes {}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  comparePassword(candidatePassword: string): boolean;
}

class User extends Model<UserAttributes, UserCreationAttributes> {
  user_id!: number;
  name!: string;
  cpf!: string;
  birthdate!: Date;
  phone_number!: string;
  photo!: string;
  state!: string;
  city!: string;
  active!: boolean;
  email!: string;
  password!: string;

  // Métodos de instancia, incluido comparePassword
  public comparePassword!: (candidatePassword: string) => boolean;
}

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: '123456789',
  database: 'challenge_buybye',
});

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING, // Cambiado de BLOB a STRING
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        const hashedPassword = bcrypt.hashSync(value, 10);
        this.setDataValue('password', hashedPassword);
      },
    },   
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false, // Desactivar seguimiento automático de fechas
  }
);

User.prototype.comparePassword = function(this: UserInstance, candidatePassword: string) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

export { sequelize, User, UserInstance }; 