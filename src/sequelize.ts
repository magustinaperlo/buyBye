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
  comparePassword(candidatePassword: string): Promise<boolean>;
  photoPath: string;
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

public hashAndSetPasswordIfNeeded(candidatePassword: string): void {
   if (this.getDataValue('password') !== candidatePassword) {
    console.log('Contraseña recibida:', candidatePassword);
    const hashedPassword = bcrypt.hashSync(candidatePassword, 10);
    this.setDataValue('password', hashedPassword);
    console.log('Contraseña recibida (hasheada):', hashedPassword);
  }
}

public async comparePassword(candidatePassword: string): Promise<boolean> {
  try {
    console.log('Inicio de la función comparePassword');
    const passHash =  this.hashAndSetPasswordIfNeeded(candidatePassword);
    console.log('Contraseña ingresada y hasheada:', passHash);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Fin de la función comparePassword');
    console.log('Contraseña almacenada en la base de datos:', this.password);
    console.log('Comparación de contraseñas:', isMatch);
    console.log('contraseña comparepassword:', candidatePassword);
    return isMatch;
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    return false;
  }
}

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
        // Verifico si la contraseña ha cambiado antes de hashear
        if (this.getDataValue('password') !== value) {
          console.log('sequelize pass recibido: ', value);
          const hashedPassword = bcrypt.hashSync(value, 10);
          this.setDataValue('password', hashedPassword);
          console.log('pass recibido hash: ', hashedPassword);
        }
      },
    },
    
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false, 
  }
);
console.log('Modelo de usuario inicializado:', User === sequelize.models.User);

export { sequelize, User, UserInstance }; 