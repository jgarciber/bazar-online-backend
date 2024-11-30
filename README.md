# Bazar Online

Bazar Online es una aplicación de comercio electrónico construida con tecnologías modernas que ofrece a los usuarios una experiencia sencilla para comprar productos en línea, gestionar su carrito de compras y realizar pedidos. Además, cuenta con un panel de administración para gestionar productos, categorías y usuarios.

La aplicación web del Bazar Online tiene como objetivo ofrecer un catálogo diverso de productos accesible para cualquier usuario interesado. No se especializa en una temática particular, sino que se enfoca en presentar una amplia gama de artículos clasificados por categorías, con el fin de satisfacer necesidades generales. Su propuesta está dirigida a usuarios de perfil medio o casual que buscan soluciones prácticas y accesibles, a través de productos comunes y de uso cotidiano.

Para acceder a la plataforma, los usuarios solo requieren un dispositivo con conexión a internet y una cuenta registrada, lo que les permitirá navegar por el catálogo y realizar compras de manera sencilla.

## Video explicativo

Para obtener una visión general rápida de la aplicación, puedes ver el siguiente video en YouTube, donde se explica brevemente cómo funciona la plataforma:  
[Enlace al video en YouTube](https://www.youtube.com/your-video-url).

## Tecnologías utilizadas

- **Backend**: Node.js con Express
- **Frontend**: Vue.js con Vite
- **Estilos**: Tailwind CSS
- **Base de datos**: MySQL (local y Azure MySQL en la nube)
- **Contenedores**: Docker y Docker Compose para facilitar el despliegue y la gestión de contenedores
- **Control de acceso**: JWT (JSON Web Tokens) para la autenticación y gestión de sesiones

## Requisitos previos

Antes de comenzar con la instalación, asegúrate de tener instalados los siguientes componentes:

- **Node.js**: Se utiliza para ejecutar el servidor de la aplicación tanto en el frontend como en el backend.
- **Docker Desktop**: Para gestionar los contenedores necesarios para el backend y la base de datos. Docker facilita el despliegue de la aplicación en distintos entornos (local y en la nube).
- **npm**: El gestor de paquetes de Node.js que se utiliza para instalar las dependencias del proyecto.

## Guía de instalación y configuración

### 1. Instalación de Node.js

Instala **Node.js**, que es necesario tanto para ejecutar el backend como para gestionar el frontend. Node.js permite la gestión de dependencias y la ejecución de servidores. Puedes descargarlo desde [aquí](https://nodejs.org).

### 2. Instalación de Docker Desktop

Instala **Docker Desktop** para gestionar los contenedores necesarios para el backend y la base de datos. Docker facilita el despliegue de la aplicación en distintos entornos (local y en la nube). Puedes descargar Docker Desktop desde [aquí](https://www.docker.com/products/docker-desktop).

### 3. Configuración de Dockerfile y docker-compose.yaml

- **Dockerfile**: Este archivo es responsable de construir la imagen del contenedor para el backend.
- **docker-compose.yaml**: Gestiona los contenedores del backend y la base de datos, asegurando que todos los servicios necesarios se ejecuten correctamente en el entorno local.

### 4. Instalación de dependencias

El proyecto está dividido en dos repositorios:

- **Backend**: [Repositorio del Backend](https://github.com/jgarciber/bazar-online-backend)
- **Frontend**: [Repositorio del Frontend](https://github.com/jgarciber/bazar-online-frontend)
#### Backend

1. Clona el repositorio de **backend**:

```bash
git clone https://github.com/jgarciber/bazar-online-backend.git
cd bazar-online-backend
```

2. Instala las dependencias para el backend ejecutando el siguiente comando en el directorio raíz del backend:

```bash
npm install
```

#### Frontend
1. Clona el repositorio de frontend:

```bash
git clone https://github.com/jgarciber/bazar-online-frontend.git
cd bazar-online-frontend/vue-project
```
2. Instala las dependencias para el frontend:

```bash
npm install
```

### 5. Configuración de la base de datos MySQL
Configura la conexión a la base de datos modificando las variables de entorno en el archivo .env para especificar los detalles de la base de datos (usuario, contraseña, host, puerto). Si usas Azure MySQL, asegúrate de configurar correctamente el acceso remoto y las credenciales.

### 6. Despliegue de la aplicación
**Local (entorno de desarrollo):**
1. **Backend:** Para iniciar la aplicación backend en tu entorno local, solo es necesario ejecutar Docker Compose. Esto levantará los contenedores necesarios para el backend y la base de datos (si es que usas una base de datos en contenedor). Ejecuta el siguiente comando desde la raíz del proyecto:

```bash
docker-compose up
```
Este comando iniciará los contenedores definidos en el archivo docker-compose.yaml y la aplicación backend estará disponible en http://localhost:3000.

2. **Frontend**: Para ejecutar el frontend de Vue.js en tu entorno local, además de levantar el contenedor de backend, necesitarás iniciar el servidor de desarrollo de Vue utilizando Vite. Esto se hace con el siguiente comando desde la carpeta del frontend:

```bash
cd frontend
npm run dev
```
Este comando inicia el servidor de desarrollo de Vue.js con Vite, y la aplicación frontend estará disponible en http://localhost:5173.

**En la nube (Azure):**
Para desplegar en Azure, sigue estos pasos:

1. **Despliegue en Azure:**

Para desplegar la aplicación en Azure, realiza los siguientes pasos:
+ Crea los recursos necesarios en Azure:
    +  Crea un App Service para el frontend (usando Node.js como entorno de ejecución).
    + Crea un App Service para el backend (también usando Node.js como entorno de ejecución).
+ Sube el código del frontend y backend a sus respectivos App Services.

2. **Configuración de la base de datos:**

+ En lugar de usar una base de datos en un contenedor Docker local, configuraremos la conexión al servicio de base de datos Azure MySQL.
+ En Azure, crea una instancia de Azure MySQL. Para ello:
    + Crea una nueva instancia de base de datos MySQL en el portal de Azure y configura el acceso remoto.
    + Toma nota de la información de la base de datos, como el host, el usuario, la contraseña, y el nombre de la base de datos.

3. **Configura las variables de entorno:**

Para que la aplicación funcione correctamente en Azure, es necesario configurar las variables de entorno en los App Services tanto para el backend como para el frontend. Estas variables de entorno reemplazarán las configuraciones locales declaradas en el archivo .env.

Pasos para configurar las variables de entorno en Azure:
+ Ve al portal de Azure.
+ Selecciona el App Service correspondiente para el backend o el frontend.
+ En el menú del App Service, ve a Configuración de la aplicación y agrega las siguientes variables de entorno en la sección de Variables de entorno:

+ **Backend:**
    + TOKEN_SECRET: La clave secreta utilizada para la firma de JSON Web Tokens (JWT).
    + PORT: El puerto en el que el backend escuchará las solicitudes (por defecto, 3000).
    + BCRYPT_SALT_ROUNDS: Número de rondas de sal en el algoritmo de bcrypt utilizado para encriptar contraseñas (por defecto, 10).
    + MYSQL_HOST: La URL del host de la base de datos, que corresponde a la instancia de Azure MySQL que has creado en Azure.
    + MYSQL_ROOT_USERNAME: El nombre del usuario root de la base de datos MySQL en Azure.
    + MYSQL_ROOT_PASSWORD: La contraseña del usuario root de la base de datos MySQL en Azure.
    + MYSQL_DATABASE: El nombre de la base de datos que se utilizará (por ejemplo, bazar_online).
+ **Frontend:**
    + VITE_HOST: La dirección en la que el frontend debe estar disponible en el entorno de producción (por ejemplo, el dominio de Azure donde se alojará).

Ejemplo de configuración en Azure:
+ **Backend:**
    - `TOKEN_SECRET=<valor_secreto>`
    - `PORT=3000`
    - `BCRYPT_SALT_ROUNDS=10`
    - `MYSQL_HOST=<host_mysql_azure>`
    - `MYSQL_ROOT_USERNAME=<nombre_usuario_root_mysql_azure>`
    - `MYSQL_ROOT_PASSWORD=<contraseña_mysql_azure>`
    - `MYSQL_DATABASE=<nombre_bd_azure>`
+ **Frontend:**
    - `VITE_HOST=<host_de_producción>`

**¿Cómo agregar las variables en Azure?**
+ En el portal de Azure, dentro de la configuración de cada App Service, ve a la sección de Configuración de la aplicación.
Agrega las variables de entorno correspondientes para el backend y frontend, tal como se indica arriba.
+ Estas variables de entorno se aplicarán a la ejecución del backend y el frontend dentro de Azure, permitiendo que el backend se conecte a la base de datos MySQL en Azure y el frontend se configure adecuadamente para el entorno de producción.

4. **Conexión a Azure MySQL:**

Una vez configuradas las variables de entorno, tu backend se conectará a la base de datos MySQL gestionada por Azure mediante las credenciales y detalles definidos. Ya no necesitarás configurar el contenedor de MySQL en el archivo docker-compose.yaml, ya que la conexión se hará directamente a Azure MySQL.

5. **Finaliza el despliegue:**

Asegúrate de que la configuración de red entre los App Services del frontend y backend sea correcta.
Si usas Azure MySQL, también debes asegurarte de que las configuraciones de seguridad en el firewall de la base de datos permitan las conexiones desde tu backend en Azure.
Una vez que hayas completado estos pasos, tu aplicación estará desplegada en Azure, con la base de datos conectada y todas las variables de entorno configuradas correctamente.

### 7. Configuración de TailwindCSS
Para configurar TailwindCSS, sigue los pasos en la documentación oficial.

Ejecuta los comandos necesarios para instalar y configurar TailwindCSS en tu proyecto frontend:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```
Crea los archivos de configuración necesarios y agrega las directivas en los archivos CSS correspondientes.

## Uso de la aplicación
La aplicación está diseñada para ofrecer una experiencia tanto para usuarios estándar como para administradores. A continuación, se describen las funcionalidades principales:

### Usuario estándar
+ Registro y autenticación: Los usuarios pueden registrarse y autenticarse utilizando JWT (JSON Web Tokens).
+ Carrito de compras: Los usuarios pueden añadir, eliminar productos y realizar compras.
+ Consultas: Los usuarios pueden consultar productos, categorías y pedidos anteriores.

### Administrador
+ Gestión de productos: Los administradores pueden añadir, modificar y eliminar productos.
+ Gestión de categorías: Pueden crear y modificar categorías de productos.
+ Gestión de usuarios: Los administradores pueden consultar y modificar la información de los usuarios, incluyendo el rol y estado de la cuenta.
+ Consulta de ventas: Los administradores pueden consultar las ventas realizadas con filtros avanzados por fecha, usuario, producto y categoría.

## Seguridad
La aplicación utiliza JWT (JSON Web Tokens) para la autenticación y control de acceso. Además, se implementan medidas de seguridad para encriptar contraseñas usando bcryptjs, y las conexiones a la base de datos MySQL se realizan de forma segura utilizando variables de entorno.

```yaml
Este archivo `README.md` cubre desde la descripción general del proyecto hasta los detalles de instalación, configuración y uso de la aplicación. También proporciona información sobre las tecnologías y seguridad utilizadas en el proyecto.
```