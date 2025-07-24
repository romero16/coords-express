/**
 * @swagger
 * tags:
 *   name: Coordenadas
 *   description: Endpoints para rutas de envío
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
 *         name: carrier_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Identificador del la transportista
 *       - in: query
 *         name: shipping_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Identificador del envío
*       - in: query
 *         name: trip_type
 *         schema:
 *           type: integer
 *         required: false
 *         description: Tipo de ruta
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
 * /api/v1/coords/find-one/carrier/{carrier_id}/shipping/{shipping_id}/type/{trip_type}:
 *   get:
 *     summary: Obtiene una sola ruta mediante los parámetros recibidos
 *     tags: [Coordenadas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carrier_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identificador del transportista
 *       - in: path
 *         name: shipping_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Identificador del envío
 *       - in: path
 *         name: trip_type
 *         schema:
 *           type: integer
 *         required: true
 *         description: Tipo de ruta
 *       - in: query
 *         name: session
 *         schema:
 *           type: string
 *         required: true
 *         description: autentificacion
 *     responses:
 *       200:
 *         description: Ruta encontrada
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
 *                   example: "Ruta obtenida correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Ruta'
 *       400:
 *         description: Parámetro faltante o inválido
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
 * components:
 *   schemas:
 *     Ruta:
 *       type: object
 *       properties:
 *         carrier_id:
 *           type: integer
 *           example: 1
 *         shipping_id:
 *           type: integer
 *           example: 1
 *         trip_type:
 *           type: integer
 *           description: Tipo de ruta
 *           example: 1
 *         coordinates:
 *           type: array
 *           description: Arreglo de coordenadas [lat, lng]
 *           items:
 *             type: array
 *             items:
 *               type: number
 *           example:
 *             - [ 19.17470992213383, -104.07304402070609]
 *             - [19.174722, -104.073056]
 */