/**
 * @swagger
 * tags:
 *   name: Coordenadas
 *   description: Endpoints para rutas geoespaciales
 */

/**
 * @swagger
 * /api/v1/coords/save:
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
 *             type: object
 *             required:
 *               - driverId
 *               - coordinates
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: ID del chofer
 *                 example: "665a13c1c2b88f36b0b6abcd"
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *                 example:
 *                   - [-99.1332, 19.4326]
 *                   - [-99.134, 19.434]
 *                   - [-99.135, 19.4355]
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
 * /api/v1/coords/find-all/{driverId}:
 *   get:
 *     summary: Obtener todas las rutas guardadas para un conductor específico
 *     tags: [Coordenadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del conductor para filtrar las rutas
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
