import {Router} from 'express'; 
import {getDashboardMetrics} from '../controllers/DashboardController';

const router = Router();

router.get("/", getDashboardMetrics);
 
export default router;