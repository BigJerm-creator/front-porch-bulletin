import { Router, type IRouter } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import adminRouter from "./admin";
import spotlightRouter from "./spotlight";
import businessSpotlightRouter from "./businessSpotlight";
import groupSpotlightRouter from "./groupSpotlight";
import churchesRouter from "./churches";
import storageRouter from "./storage";
import newsletterRouter from "./newsletter";
import calendarEventsRouter from "./calendarEvents";
import aboutRouter from "./about";
import issueSettingsRouter from "./issueSettings";
import letterToEditorRouter from "./letterToEditor";
import donateRouter from "./donate";

const router: IRouter = Router();

router.use(storageRouter);
router.use(healthRouter);
router.use("/articles", articlesRouter);
router.use("/categories", categoriesRouter);
router.use("/admin", adminRouter);
router.use("/spotlight", spotlightRouter);
router.use("/business-spotlight", businessSpotlightRouter);
router.use("/group-spotlight", groupSpotlightRouter);
router.use("/churches", churchesRouter);
router.use("/newsletter", newsletterRouter);
router.use("/calendar-events", calendarEventsRouter);
router.use("/about", aboutRouter);
router.use("/issue-settings", issueSettingsRouter);
router.use("/letter-to-editor", letterToEditorRouter);
router.use("/donate", donateRouter);

export default router;
