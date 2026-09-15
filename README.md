# TechNovaGT Store
Sistema de Carrito de Ventas con Observables y Pipes.

Este sistema incluye backend con conexión a base de datos (PostgreSQL). No es necesaria la creación de la base desde pgAdmin, el propio repositorio cuenta con un archivo `./src/setup.js` para inicializarla.

## Instalación y Ejecución del Proyecto
1. Clonar el repositorio
``` bash
git clone https://github.com/kmorales-2025027/Bimestre4_Actividad3.git
```

2. Una vez dentro de él, instalamos las dependencias necesarias
``` bash
pnpm install
```

3. Ejecutar Backend
``` bash
pnpm dev
```

4. Ingresar al directorio `./frontend`
``` bash
cd frontend
```

5. Ejecutar Frontend
``` bash
ng serve
```

> _**Nota:**_ El puerto predeterminado donde se ejecuta el backend es el `3000`. El puerto predeterminado del frontend es el `4200`.

## Diseño del Flujo del Carrito
### Servicios
Los dos servicios, `product.service.ts` y `cart.service.ts` son responsables de manejar las operaciónes _HTTP_ de forma asíncrona. Utilizan _Observables_ para no realizar ninguna acción hasta que son llamados.

### Uso de Observables
Como bien dijimos, están declarados en los servicios. Sin embargo, cada componente se encarga de manejar las notificaciones emitidas, renderizando registros en tablas, mensajes de ayuda y/o error, o también estados de carga según sea necesario. Para esto se usa la subscripción `.subscribe()`.

### Pipes
En este caso, existen 2 pipes personalizados: `subtotal-pipe.ts` y `total-cart-pipe.ts`. Ambos actúan como formatos de moneda. Se encargan de realizar los cálculos (sumas y multiplicaciones de precio y cantidad) y los muestran como una cadena de texto, representando un número aproximado a dos decimales.
