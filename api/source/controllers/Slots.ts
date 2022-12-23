import { NextFunction, Request, Response } from 'express';
import Slots from '@/models/Slots';
import { dayIdByDate } from '@/library/DaysUtils'
import mongoose from 'mongoose';
import Log from '@/library/Logging'

const readAllSlotsForDoctor = (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.doctorId;
    return Slots.find({ doctorId: doctorId })
        .populate({
            path: 'doctorId',
            select: 'firstname lastname specialization -_id'
        })
        .then((slots) => ((slots && slots.length !== 0) ? res.status(200).json({ slots }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => {
            res.status(500).json({ error })
        });
};

const readAllSlotsForDoctorAndDay = async (req: Request, res: Response, next: NextFunction) => {
    const doctorIdString = req.params.doctorId;
    const doctorId = new mongoose.Types.ObjectId(doctorIdString);

    const dayDateString = req.query.date as string;
    const dayDateNonUTC = new Date(dayDateString)
    const dayDate = new Date(Date.UTC(dayDateNonUTC.getUTCFullYear(), dayDateNonUTC.getUTCMonth(), dayDateNonUTC.getUTCDate() + 1, 0, 0, 0, 0));

    const dayId = await dayIdByDate(doctorId, dayDate)
        .then((result) => {
            return result;
        })
        .catch((error) => {
            throw error;
        });

    return Slots.findOne({ doctorId: doctorId, dayId: dayId })
        .populate({
            path: 'doctorId',
            select: 'firstname lastname specialization -_id'
        })
        .then((slots) => ((slots) ? res.status(200).json({ slots }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => {
            res.status(500).json({ error })
        });
};

const readAllSlotsForAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
    return Slots.find()
        .populate({
            path: 'doctorId',
            select: 'firstname lastname specialization -_id'
        })
        .then((slots) => res.status(200).json({ slots }))
        .catch((error) => {
            res.status(500).json({ error })
        });
};


export default { readAllSlotsForDoctor, readAllSlotsForDoctorAndDay, readAllSlotsForAllDoctors };