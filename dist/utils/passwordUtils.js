"use strict";
//senha forte com no mínimo 8 caracteres contendo pelo menos 1 letra, 1 número e 1 caractere especial)
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStrongPassword = exports.strongPasswordRegex = void 0;
exports.strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
function isStrongPassword(password) {
    //control
    console.log('Contraseña recibida:', password);
    console.log('Resultado del regex:', exports.strongPasswordRegex.test(password));
    return exports.strongPasswordRegex.test(password);
}
exports.isStrongPassword = isStrongPassword;
