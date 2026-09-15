import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

function validateCart({ id_producto, cantidad }) {
    if (!Number.isInteger(id_producto) || id_producto <= 0) {
        return 'El ID del producto debe ser un número mayor a 0.';
    }

    if (!Number.isInteger(cantidad) || cantidad < 0) {
        return 'El stock debe ser un número entero mayor o igual a 0.';
    }

    return null;
}

router.get('/', async (_req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, p.nombre, p.precio 
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id
            ORDER BY c.id ASC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('*Error*: No se pudo obtener todo el carrito.', error);
        res.status(500).json({ message: 'No se pudo obtener todo el carrito.' });
    }
});

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0 ) {
        return res.status(400).json({ message: 'El ID del carrito no es válido.' });
    }

    try {
        const result = await pool.query(`
            SELECT c.*, p.nombre, p.precio
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id
            WHERE c.id = $1`, [id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: `No se encontró el carrito con ID ${id}.` });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('*Error*: No se pudo obtener el carrito.', error);
        res.status(500).json({ message: 'No se pudo obtener el carrito.' });
    }
});

router.post('/', async (req, res) => {
    const { id_producto, cantidad } = req.body;
    const validationError = validateCart({ id_producto, cantidad });

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const client = await pool.connect(); // Un solo flujo para todas las operaciones.

    try {
        await client.query("BEGIN");

        const productCheck = await client.query(
            "SELECT stock FROM productos WHERE id = $1",
            [id_producto]
        );

        if (!productCheck.rows[0]) {
            await client.query("ROLLBACK"); // Revertir cambios.
            return res.status(404).json({ message: "El producto no existe." });
        }

        if (productCheck.rows[0].stock < cantidad) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Stock insuficiente." });
        }

        /* Se declaró id_producto como único en la base de datos.
         * Por ende, si se intenta registrar otro carrito con el mismo id_producto, sucederá un conflicto.
         * Esta query maneja el conflicto sumando ambas cantidades:
         * la que ya existe + la que se intenta registrar.
         */
        const result = await pool.query(`
            INSERT INTO carrito (id_producto, cantidad)
            VALUES ($1, $2)
            ON CONFLICT (id_producto)
            DO UPDATE SET cantidad = carrito.cantidad + EXCLUDED.cantidad
            RETURNING *`, [id_producto, cantidad]
        );

        await client.query(`
            UPDATE productos 
            SET stock = stock - $1 
            WHERE id = $2`,
            [cantidad, id_producto]
        );

        await client.query("COMMIT"); // Confirmar cambios.
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error('*Error*: No se pudo registrar el carrito.', error);
        res.status(500).json({ message: 'No se pudo registrar el carrito.' });
    } finally {
        client.release(); // Liberamos el cliente de vuelta al pool.
    }
});

router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'El ID del carrito no es válido.' });
    }

    const { id_producto, cantidad } = req.body;
    const validationError = validateCart({ id_producto, cantidad });

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const result = await pool.query(`
            UPDATE carrito
            SET id_producto = $1, cantidad = $2
            WHERE id = $3
            RETURNING *
            `,
            [id_producto, cantidad, id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: `No se encontró el carrito con ID ${id}.` });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('*Error*: No se pudo actualizar el carrito.', error);
        res.status(500).json({ message: 'No se pudo actualizar el carrito.' });
    }
});

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'El ID del carrito no es válido.' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM carrito WHERE id = $1 RETURNING id', [id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: `No se encontró el carrito con ID ${id}.` });
        }

        res.json({ message: 'Carrito eliminado exitosamente.' });
    } catch (error) {
        console.error('*Error*: No se pudo eliminar el carrito.', error);
        res.status(500).json({ message: 'No se pudo eliminar el carrito.' });
    }
});

export default router;
