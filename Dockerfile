# Usa una imagen base de Node.js
FROM node:23-alpine

# Copia el contenido de tu proyecto dentro del contenedor
COPY . /app/

# Establece el directorio de trabajo
WORKDIR /app

# Instala las dependencias necesarias
RUN npm install

# Expone el puerto 80 para HTTP
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["node", "app.js"]