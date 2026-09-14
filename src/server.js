import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';

const app = express();

// Esto evita que express genere identificadores de caché / para que no me tire un error 304
app.set('etag', false);
// Esto evita mostrar información que puede llegar a ser sensible mas adelante / me dice que trabaje con express
app.set('x-powered-by', false);

// Esto me dice que el navegador no guardara información como datos del usuario, información privada
app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

app.use(cors());
app.use(express.json());

app.use('/api/productos', productsRoutes);
app.use('/api/carrito', cartRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'backend-login' });
});

const port = Number(process.env.BACKEND_PORT) || 3000;

export const server = app.listen(port, () => {
    console.log(`Backend ejecutado en http://localhost:${port}`);
});