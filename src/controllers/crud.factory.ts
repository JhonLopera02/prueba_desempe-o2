import { Request, Response } from "express";
import { Model, ModelStatic } from "sequelize";

/**
 * Elimina el campo `password` de cualquier objeto o array de objetos antes
 * de enviarlo como respuesta JSON. Compatible con instancias Sequelize y objetos planos.
 *
 * @param data - Instancia de modelo, array de instancias u objeto plano.
 * @returns El mismo dato sin el campo `password`.
 */
const sanitizeData = (data: any): any => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }
  if (typeof data.toJSON === "function") {
    const json = data.toJSON();
    delete json.password;
    return json;
  }
  if (typeof data === "object" && data.password !== undefined) {
    const { password, ...rest } = data;
    return rest;
  }
  return data;
};

/**
 * Genera un conjunto de funciones CRUD estándar para cualquier modelo Sequelize.
 *
 * Las operaciones de eliminación son lógicas: cambian el campo `estado` a "eliminado"
 * en lugar de eliminar el registro físicamente. Las consultas solo retornan
 * registros con `estado = "activo"`.
 *
 * Las contraseñas son eliminadas automáticamente de todas las respuestas JSON.
 *
 * @template T - Tipo del modelo Sequelize.
 * @param model      - Clase del modelo Sequelize al que se aplicarán las operaciones.
 * @param entityName - Nombre descriptivo de la entidad (usado en mensajes de respuesta).
 * @returns Objeto con las funciones: `getAll`, `getById`, `create`, `update`, `remove`.
 */
export function crudController<T extends Model>(model: ModelStatic<T>, entityName: string) {
  /**
   * Obtiene todos los registros activos de la entidad.
   *
   * @param req - Request de Express.
   * @param res - Response con el array de registros activos.
   * @returns 200 con el listado; 500 si ocurre un error interno.
   */
  const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const items = await model.findAll({ where: { estado: "activo" } as any });
      res.status(200).json({ success: true, data: sanitizeData(items) });
    } catch (error) {
      console.error(`Error en getAll ${entityName}:`, error);
      res.status(500).json({ success: false, message: `Error al obtener ${entityName}` });
    }
  };

  /**
   * Obtiene un único registro activo de la entidad por su UUID.
   *
   * @param req - Request con `params.id`.
   * @param res - Response con el registro encontrado.
   * @returns 200 si existe; 404 si no se encuentra o está eliminado; 500 en error interno.
   */
  const getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await model.findOne({
        where: { id: req.params.id, estado: "activo" } as any,
      });
      if (!item) {
        res.status(404).json({ success: false, message: `${entityName} no encontrado` });
        return;
      }
      res.status(200).json({ success: true, data: sanitizeData(item) });
    } catch (error) {
      console.error(`Error en getById ${entityName}:`, error);
      res.status(500).json({ success: false, message: `Error al obtener ${entityName}` });
    }
  };

  /**
   * Crea un nuevo registro de la entidad con los datos del body.
   *
   * @param req - Request con el cuerpo de la petición.
   * @param res - Response con el registro creado.
   * @returns 201 si se creó; 400 si la validación falla; 500 en error interno.
   */
  const create = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await model.create(req.body as any);
      res.status(201).json({ success: true, message: `${entityName} creado`, data: sanitizeData(item) });
    } catch (error: any) {
      console.error(`Error en create ${entityName}:`, error);
      res.status(400).json({ success: false, message: error.message || `Error al crear ${entityName}` });
    }
  };

  /**
   * Actualiza un registro activo de la entidad por su UUID.
   *
   * @param req - Request con `params.id` y el cuerpo con los campos a actualizar.
   * @param res - Response con el registro actualizado.
   * @returns 200 si se actualizó; 404 si no existe o está eliminado; 400 o 500 en error.
   */
  const update = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await model.findOne({
        where: { id: req.params.id, estado: "activo" } as any,
      });
      if (!item) {
        res.status(404).json({ success: false, message: `${entityName} no encontrado` });
        return;
      }
      await item.update(req.body);
      res.status(200).json({ success: true, message: `${entityName} actualizado`, data: sanitizeData(item) });
    } catch (error: any) {
      console.error(`Error en update ${entityName}:`, error);
      res.status(400).json({ success: false, message: error.message || `Error al actualizar ${entityName}` });
    }
  };

  /**
   * Elimina lógicamente un registro de la entidad cambiando su `estado` a "eliminado".
   * No realiza borrado físico en la base de datos.
   *
   * @param req - Request con `params.id`.
   * @param res - Response con mensaje de confirmación.
   * @returns 200 si se eliminó; 404 si no existe o ya estaba eliminado; 400 o 500 en error.
   */
  const remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await model.findOne({
        where: { id: req.params.id, estado: "activo" } as any,
      });
      if (!item) {
        res.status(404).json({ success: false, message: `${entityName} no encontrado` });
        return;
      }
      await item.update({ estado: "eliminado" } as any);
      res.status(200).json({ success: true, message: `${entityName} eliminado` });
    } catch (error: any) {
      console.error(`Error en remove ${entityName}:`, error);
      res.status(400).json({ success: false, message: error.message || `Error al eliminar ${entityName}` });
    }
  };

  return { getAll, getById, create, update, remove };
}