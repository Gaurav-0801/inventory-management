import {Router} from 'express'; 
import {getExpensesByCategory} from '../controllers/ExpenseController';


const router = Router();

router.get("/", getExpensesByCategory);
 
export default router;