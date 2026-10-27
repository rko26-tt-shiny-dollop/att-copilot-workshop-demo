import { Router, type Request, type Response } from "express";
import type { InMemoryRepository, Identified } from "../repositories/InMemoryRepository.js";
import { notFound, sendError } from "../utils/errors.js";

/**
 * Build a standard REST CRUD router for a repository.
 * GET /, GET /:id, POST /, PUT /:id, DELETE /:id
 */
export function crudRouter<T extends Identified>(
  repo: InMemoryRepository<T>,
  entityName: string
): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.json(repo.getAll());
  });

  router.get("/:id", (req: Request, res: Response) => {
    try {
      const item = repo.getById(Number(req.params.id));
      if (!item) throw notFound(entityName, req.params.id);
      res.json(item);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post("/", (req: Request, res: Response) => {
    try {
      const created = repo.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.put("/:id", (req: Request, res: Response) => {
    try {
      const updated = repo.update(Number(req.params.id), req.body);
      if (!updated) throw notFound(entityName, req.params.id);
      res.json(updated);
    } catch (err) {
      sendError(res, err);
    }
  });

  router.delete("/:id", (req: Request, res: Response) => {
    try {
      const ok = repo.delete(Number(req.params.id));
      if (!ok) throw notFound(entityName, req.params.id);
      res.status(204).send();
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
}
