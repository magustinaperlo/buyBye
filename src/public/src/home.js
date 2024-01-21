/* // Importa el paquete jwt-decode
import jwt_decode from 'jwt-decode';

// Obtén el token almacenado en localStorage
const token = localStorage.getItem('token');
console.log('estoy en home js:');
if (token) {
    console.log('estoy en el if del home js:');
  // Decodifica el token para obtener la información del usuario
  const decodedToken = jwt_decode(token);

const photoPath = decodedToken.photoPath;
console.log('estoy dsp del photopath de home js:');
// Mostrar la foto del usuario en tu interfaz de usuario
const photoElement = document.getElementById('user-photo');
photoElement.src = photoPath;
  console.log('Usuario ID:', decodedToken.userId);
  console.log('Email del usuario:', decodedToken.email);
  console.log(decodedToken.userId, decodedToken.email);
}
 */
// Importa el paquete jwt-decode
import jwt_decode from 'jwt-decode';

// Obtén el token almacenado en localStorage
const token = localStorage.getItem('token');
console.log('estoy en home js:');
if (token) {
    console.log('estoy en el if del home js:');
  // Decodifica el token para obtener la información del usuario
  const decodedToken = jwt_decode(token);

  const photoPath = decodedToken.photoPath;

  // Mostrar la foto del usuario en tu interfaz de usuario
  const photoElement = document.getElementById('user-photo');
  photoElement.src = photoPath;

  // Obtener el nombre del usuario del token
  const userName = decodedToken.userName;

  // Mostrar el nombre del usuario en tu interfaz de usuario
  const userNameElement = document.getElementById('user-name');
  userNameElement.innerText = `¡Hola, ${userName}!`;

  console.log('Usuario ID:', decodedToken.userId);
  console.log('Email del usuario:', decodedToken.email);
  console.log('Nombre del usuario:', userName);
}
