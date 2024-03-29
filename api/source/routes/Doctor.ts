import express from 'express';
import controller from '@/controllers/Doctor';
import userController from '@/controllers/User';
import { ROLES } from '@/config/settings';
import userVerification from '@/middleware/UserVerification';
const router = express.Router();

//Sciezki niezabepieczone
router.get('/get/:doctorId', controller.readDoctor);
router.get('/get/', controller.readAllDoctors);

//Sciezki zabezpieczone
router.use(userVerification.verifyJWT);
router.use(userVerification.verifyRoles([ROLES.admin, ROLES.doctor]));
router.post('/create', controller.createDoctor);
router.patch('/update/:doctorId', controller.updateDoctor);
router.delete('/delete/:doctorId', controller.deleteDoctor);

export = router;
