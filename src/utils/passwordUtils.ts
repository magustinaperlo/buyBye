//senha forte com no mínimo 8 caracteres contendo pelo menos 1 letra, 1 número e 1 caractere especial)

export const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export function isStrongPassword(password: string): boolean {
  //control
  console.log('Contraseña recibida:', password);
  console.log('Resultado del regex:', strongPasswordRegex.test(password));
  return strongPasswordRegex.test(password);
}


