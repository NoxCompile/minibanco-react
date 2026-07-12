# XBank · Mini Banco Digital

Prototipo de banca digital reactiva desarrollado con React, Vite y Firebase. Construido como evaluación de Programación Front End (TI3V31).

## 🚀 Instrucciones de Instalación y Ejecución

1. Clonar este repositorio en tu máquina local.
2. Abrir la terminal en la raíz del proyecto y ejecutar la instalación de dependencias:
   ```bash
   npm install

0. Configurar las credenciales de base de datos:
Duplicar el archivo .env.example y renombrarlo como .env.
Llenar las variables con las credenciales de tu proyecto de Firebase.
1. Iniciar el servidor local:
npm run dev
2. Abrir el navegador en el enlace proporcionado (usualmente http://localhost:5173/).

👥 Usuarios de Prueba

Para probar las transferencias en tiempo real, puedes utilizar estas credenciales pre-configuradas (ambas cuentas inician con $100.000 de saldo):
•Usuario 1: prueba1@xbank.com | Clave: 123456
•Usuario 2: prueba2@xbank.com | Clave: 123456

🗄️ Modelo de Datos (Cloud Firestore)

La aplicación utiliza un modelo NoSQL jerárquico optimizado para suscripciones reactivas:
•Colección users/{uid}: El ID del documento coincide estrictamente con el UID de Firebase Authentication.
 •nombre (string)
 •email (string)
 •saldo (number)

•Colección movimientos/{id}: Documentos con ID autogenerado, guardados a través de transacciones atómicas.
 •emisorUid (string) e emisorEmail (string)
 •receptorUid (string) y receptorEmail (string)
 •monto (number)
 •fecha (timestamp de servidor)

🤖 Uso de Inteligencia Artificial

 Durante el desarrollo de este proyecto utilicé un asistente de IA para estructurar la arquitectura base de React bajo el paradigma de "Separación de Responsabilidades". Le pedí asistencia específica para implementar el estado global (useContext + useReducer) y asegurar la lógica de transacciones atómicas. La herramienta fue fundamental para diagnosticar fallos de caché de NPM en mi entorno local y guiarme en la creación de índices compuestos. Tuve que corregir e intervenir el código manualmente cuando la IA duplicó importaciones en el módulo de servicios, generando conflictos de sintaxis.

 ## 🧪 Testing y Aseguramiento de Calidad

Este proyecto cuenta con una suite de pruebas unitarias y de componentes implementada con **Vitest** y **React Testing Library**.

### Ejecución de Pruebas
Para ejecutar la batería de pruebas en modo interactivo:
\`\`\`bash
npm test
\`\`\`

Para generar el reporte de cobertura de código:
\`\`\`bash
npm run coverage
\`\`\`

### Refactorización para Testabilidad
Para aislar la lógica de negocio y facilitar el testing, se extrajeron las validaciones de las transferencias desde el componente \`TransferForm.jsx\` hacia una función pura \`validarTransferencia\` ubicada en \`src/utils/validaciones.js\`. Esto permitió probar exhaustivamente los casos borde (montos negativos, decimales, fondos insuficientes) sin depender del renderizado de React.

![alt text](<Reporte de cobertura.png>)

---

## 🤖 Declaración de Uso de IA

Durante la fase de testing, se utilizó un asistente de IA para agilizar la redacción de pruebas repetitivas y estructurar la sintaxis de los *mocks* de Firebase con Vitest (`vi.mock`). 

**Ejemplo de ajuste manual:**
La IA inicialmente sugirió un test para el "Caso Feliz" del componente \`TransferForm\` que fallaba debido a una condición de carrera (la aserción sobre el botón deshabilitado se ejecutaba después de que la promesa simulada ya se había resuelto). Fue necesario intervenir e implementar una "promesa controlada" para pausar intencionalmente la resolución del *mock* de \`dbService.executeTransfer\` y poder verificar el estado de carga intermedio de la interfaz.