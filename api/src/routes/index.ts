import { Router } from "express";
import v1Routes from "./v1Routes";

const routes = Router();

/**Use the v1 routes for any requests that start with "/api/v1" */
routes.use("/v1", v1Routes);

/**Add future versions like so:
 * routes.use('/v2', v2Routes); */

export default routes;
