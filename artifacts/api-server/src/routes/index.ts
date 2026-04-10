import { Router, type IRouter } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import adminRouter from "./admin";
import spotlightRouter from "./spotlight";
import churchesRouter from "./churches";
import obituariesRouter from "./obituaries";
import storageRouter from "./storage";
import newsletterRouter from "./newsletter";
import calendarEventsRouter from "./calendarEvents";

const router: IRouter = Router();

router.use(storageRouter);
router.use(healthRouter);
router.use("/articles", articlesRouter);
router.use("/categories", categoriesRouter);
router.use("/admin", adminRouter);
router.use("/spotlight", spotlightRouter);
router.use("/churches", churchesRouter);
router.use("/obituaries", obituariesRouter);
router.use("/newsletter", newsletterRouter);
router.use("/calendar-events", calendarEventsRouter);

export default router;
