/**
 * @swagger
 * tags:
 *   name: Coordenadas
 *   description: Endpoints para rutas geoespaciales
 */
/**
 * @swagger
 * /api/v1/coords/find-all:
 *   get:
 *     summary: Obtener todas las rutas guardadas o friltradas
 *     tags: [Coordenadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del usuario
 *       - in: query
 *         name: carrier_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID de la transportista
 *       - in: query
 *         name: shipping_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del envío
 *     responses:
 *       200:
 *         description: Lista de rutas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Rutas obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ruta'
 *       400:
 *         description: Parámetro faltante o inválido
 *       500:
 *         description: Error del servidor
 */


/**
 * @swagger
 * /api/v1/coords/save-coords:
 *   post:
 *     summary: Guardar o actualizar la ruta de un chofer
 *     tags: [Coordenadas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: array
 *               items:
 *                 type: number
 *             example:
 *               - [-104, 19]
 *               - [-104.0000661, 19]
 *     responses:
 *       201:
 *         description: Coordenadas guardadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ruta'
 *       400:
 *         description: Petición inválida
 *       500:
 *         description: Error del servidor
 */


/**
 * @swagger
 * /api/v1/coords/current-route:
 *   get:
 *     summary: Obtiene la ruta actual mediante el token
 *     tags: [Coordenadas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Rutas obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ruta'
 *       400:
 *         description: Parámetro driverId faltante o inválido
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ruta:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         driver:
 *           type: string
 *           description: ID del chofer
 *         path:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: LineString
 *             coordinates:
 *               type: array
 *               items:
 *                 type: array
 *                 items:
 *                   type: number
 *         timestamp:
 *           type: string
 *           format: date-time
 *         __v:
 *           type: integer
 */
