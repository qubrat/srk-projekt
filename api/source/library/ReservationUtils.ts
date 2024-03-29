import 'module-alias/register';
import Reservation from '@/models/Reservation';
import Slots from '@/models/Slots';
import mongoose from 'mongoose';
import { dayIdByDate } from '@/library/DaysUtils';
import { RESERVATION_CODE_LENGTH } from '@/config/settings';
import Log from '@/library/Logging';

export { generateReservationCode, updateSlotForNewReservation, makeSlotAvailable, deleteOutdatedReservation, flagAsRegistered };

const generateReservationCode = async () => {
	const characters = '0123456789';
	let result = '';
	let control = [];
	do {
		while (result.length < RESERVATION_CODE_LENGTH) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		control = await Reservation.find({ reservationCode: result }).exec();
	} while (control.length !== 0);
	return result;
};

const updateSlotForNewReservation = async (doctorId: string, dayId: string, dayDate: Date, time: string) => {
	const doctor = new mongoose.Types.ObjectId(doctorId);
	const day = new mongoose.Types.ObjectId(dayId);
	const occupied = await Reservation.findOne({ doctorId: doctorId, day: dayDate, time: time });
	if (occupied) {
		throw Error('Reservation with given details already exists.');
	}
	const slotsObj = await Slots.findOne({ doctorId: doctor, dayId: day });
	if (slotsObj) {
		const found = slotsObj.slots.find((slot: { start: string }) => {
			return slot.start === time;
		});
		if (found) {
			if (found.availability) {
				found.availability = false;
				Log.info('Slot updated.');
				await slotsObj.save();
			} else {
				throw Error('Slot occupied.');
			}
		} else {
			throw Error('Object with specified time cannot be found in days array of slots object.');
		}
	} else {
		throw Error('Slots object with specified doctorID or dayID does not exist.');
	}
};

const makeSlotAvailable = async (reservationId: string) => {
	const reservation = await Reservation.findById(reservationId);
	if (reservation) {
		const doctorId = new mongoose.Types.ObjectId(reservation.doctorId);
		const dayId = await dayIdByDate(doctorId, reservation.day)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				throw error;
			});
		const day = new mongoose.Types.ObjectId(dayId);
		const slotsObj = await Slots.findOne({ doctorId: doctorId, dayId: day });
		if (slotsObj) {
			const found = slotsObj.slots.find((slot: { start: string }) => {
				return slot.start === reservation.time;
			});
			if (found) {
				if (!found.availability) {
					found.availability = true;
					slotsObj.save();
				} else {
					throw Error('Slot already free.');
				}
			} else {
				throw Error('Object with specified time cannot be found in days array of slots object.');
			}
		} else {
			throw Error('Slots object with specified doctorID or dayID does not exist.');
		}
	}
};

const deleteOutdatedReservation = async () => {
	const todayNonUTC = new Date();
	const today = new Date(Date.UTC(todayNonUTC.getUTCFullYear(), todayNonUTC.getUTCMonth(), todayNonUTC.getUTCDate(), 0, 0, 0, 0));
	let aux = 0;

	const reservations = await Reservation.find().exec();
	for (const reservation of reservations) {
		if (reservation.day.getTime() < today.getTime()) {
			await Reservation.findByIdAndDelete(reservation._id);
			aux++;
		}
	}

	if (aux !== 0) {
		Log.debug('Outdated reservations have been deleted.');
	}
};

const flagAsRegistered = async (reservationCode: string) => {
	const reservation = await Reservation.findOne({ reservationCode: reservationCode }).exec();
	if (!reservation) {
		throw Error('Reservation with given code not found.');
	} else {
		reservation.registered = true;
		reservation.save();
	}
};
