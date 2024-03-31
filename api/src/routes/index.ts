import { Router } from "express";
import v1Routes from "./v1";

const router = Router();

/**Use the v1 routes for any requests that start with "/api/v1" */
router.use("/v1", v1Routes);

/**Add future versions like so:
 * router.use('/v2', v2Routes); */

export default router;
