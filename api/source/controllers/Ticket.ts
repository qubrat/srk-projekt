import { Request, response, Response } from 'express';
import mongoose from 'mongoose';
import Ticket from '@/models/Ticket';
import Log from '@/library/Logging';
import { generateVisitCode } from '@/library/TicketUtils';
import { insertTicketIntoQue } from '@/library/QueEngine';
import queController from '@/controllers/Que';

const createTicket = async (req: Request, res: Response) => {
	const { queId, visitTime, reservationCode } = req.body;
	const queIdObj = new mongoose.Types.ObjectId(queId);
	try {
		const visitCode = await generateVisitCode(queId);
		const ticketId = new mongoose.Types.ObjectId();
		const ticket = new Ticket({
			_id: ticketId,
			queId: queIdObj,
			priority: 5,
			visitCode: visitCode,
			visitTime: visitTime,
			reservationCode: reservationCode
		});
		return ticket
			.save()
			.then(async (ticket) => {
				const queResponse = await insertTicketIntoQue(ticketId);
				queController.updateQuePanel();
				res.status(201).json({ ticket, queResponse });
			})
			.catch((error) => {
				throw error;
			});
	} catch (error) {
		Log.error(error);
		res.status(500).json({ error });
	}
};

const readTicket = async (req: Request, res: Response) => {
	const ticketId = req.params.ticketId;
	try {
		return await Ticket.findById(ticketId).then((ticket) => (ticket ? res.status(200).json({ ticket }) : res.status(404).json({ message: 'Not found' })));
	} catch (error) {
		Log.error(error);
		res.status(500).json({ error });
	}
};

const readAllTickets = async (req: Request, res: Response) => {
	const reservationCode = req.query.reservationCode; //TODO - query dla pojedynczej kolejki jako queId
	try {
		if (reservationCode) {
			return await Ticket.findOne({ reservationCode: reservationCode }).then((ticket) => (ticket ? res.status(200).json({ ticket }) : res.status(404).json({ message: 'Not found' })));
		} else {
			return await Ticket.find().then((ticket) => (ticket ? res.status(200).json({ ticket }) : res.status(404).json({ message: 'Not found' })));
		}
	} catch (error) {
		Log.error(error);
		res.status(500).json({ error });
	}
};

const updateTicket = async (req: Request, res: Response) => {
	const ticketId = req.params.ticketId;

	return await Ticket.findById(ticketId)
		.then((ticket) => {
			if (ticket) {
				ticket.set(req.body);

				return ticket.save().then((ticket) => res.status(201).json({ ticket }));
			} else {
				res.status(404).json({ message: 'Not found' });
			}
		})
		.catch((error) => res.status(500).json({ error }));
};

const deleteTicket = async (req: Request, res: Response) => {
	const ticketId = req.params.ticketId;
	try {
		const ticket = await Ticket.findByIdAndDelete(ticketId);
		return ticket ? res.status(201).json({ message: `Deleted ticket: ${ticketId}` }) : res.status(404).json({ message: 'Not found' });
	} catch (error) {
		Log.error(error);
		return res.status(500).json({ error });
	}
};

export default { createTicket, readTicket, readAllTickets, updateTicket, deleteTicket };
