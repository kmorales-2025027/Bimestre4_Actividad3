import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

function validateProduct({ nombre, precio, stock }) {
    if (typeof nombre !== 'string' || !nombre.trim()) {
        return 'El nombre es obligatorio.';
    }

    if (nombre.trim().length > 100) {
        return 'El nombre no puede superar los 100 caracteres.';
    }

    if (typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0) {
        return 'El precio debe ser un número mayor a 0.';
    }

    if (!Number.isInteger(stock) || stock < 0) {
        return 'El stock debe ser un número entero mayor o igual a 0.';
    }

    return null;
}

router.get('/', async (_req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM productos ORDER BY id ASC'
        );

        res.json(result.rows);
    } catch (error) {
        console.error('*Error*: No se pudieron obtener los productos.', error);
        res.status(500).json({ message: 'No se pudieron obtener los productos.' });
    }
});

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'El ID del producto no es válido.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM productos WHERE id = $1', [id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: `No se encontró el producto con ID ${id}.` });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('*Error*: No se pudo obtener el producto.', error);
        res.status(500).json({ message: 'No se pudo obtener el producto.' });
    }
});

router.post('/', async (req, res) => {
    const { nombre, precio, stock } = req.body;
    const validationError = validateProduct({ nombre, precio, stock });

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const result = await pool.query(`
            INSERT INTO productos (nombre, precio, stock)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [nombre.trim(), precio, stock]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('*Error*: No se pudo registrar el producto.', error);
        res.status(500).json({ message: 'No se pudo registrar el producto.' });
    }
});

router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'El ID del producto no es válido.' });
    }

    const { nombre, precio, stock } = req.body;
    const validationError = validateProduct({ nombre, precio, stock });

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const result = await pool.query(`
            UPDATE productos
            SET nombre = $1, precio = $2, stock = $3
            WHERE id = $4
            RETURNING *
            `,
            [nombre.trim(), precio, stock, id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: `No se encontró el producto con ID ${id}.` });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('*Error*: No se pudo actualizar el producto.', error);
        res.status(500).json({ message: 'No se pudo actualizar el producto.' });
    }
});

router.delete('/:id', async(req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'El ID del producto no es válido.' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM productos WHERE id = $1 RETURNING id', [id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: `No se encontró el producto con id ${id}.` });
        }

        res.json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error('*Error*: No se pudo eliminar el producto.', error);
        res.status(500).json({ message: 'No se pudo eliminar el producto.' });
    }
});

export default router;
