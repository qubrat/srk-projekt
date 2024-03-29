import { Request, Response, response } from 'express';
import mongoose from 'mongoose';
import Que from '@/models/Que';
import Log from '@/library/Logging';

let updateResponse: Response = response;

function queEventsHandler(request: Request, response: Response) {
	const headers = {
		'Content-Type': 'text/event-stream',
		Connection: 'keep-alive',
		'Cache-Control': 'no-cache'
	};
	response.writeHead(200, headers);

	const data = `data: ${JSON.stringify('Connection Established')}\n\n`;

	response.write(data);
	updateResponse = response;
}

function updateQuePanel() {
	return updateResponse.write(`data: ${JSON.stringify('Que updated')}\n\n`);
}

const createQue = async (req: Request, res: Response) => {
	const { doctorId, roomNumber } = req.body;
	const doctorIdObj = new mongoose.Types.ObjectId(doctorId);
	const ticketArray: mongoose.Types.ObjectId[] = [];
	try {
		let que;
		if (!doctorIdObj) {
			throw new Error('DoctorId is empty!');
		} else {
			que = new Que({
				doctorId: doctorIdObj,
				roomNumber,
				activeTickets: ticketArray
			});
			await que.save();
			updateQuePanel();
			return res.status(201).json({ que });
		}
	} catch (error) {
		Log.error(error);
		return res.status(500).json({ error });
	}
};

const readQue = async (req: Request, res: Response) => {
	const queId = req.params.queId;
	try {
		return await Que.findById(queId)
			.populate('doctorId activeTickets', 'firstname lastname visitTime visitCode')
			.then((que) => (que ? res.status(200).json({ que }) : res.status(404).json({ message: 'Not found' })));
	} catch (error) {
		Log.error(error);
		res.status(500).json({ error });
	}
};

const readAllQues = async (req: Request, res: Response) => {
	const doctorId = req.query.doctorId;
	try {
		if (doctorId) {
			return await Que.findOne({ doctorId: doctorId })
				.populate('doctorId activeTickets', 'firstname lastname visitTime visitCode')
				.then((que) => (que ? res.status(200).json({ que }) : res.status(404).json({ message: 'Not found' })));
		} else {
			return await Que.find()
				.sort({ roomNumber: 1 })
				.populate('doctorId activeTickets', 'firstname lastname visitTime visitCode')
				.then((que) => (que ? res.status(200).json({ que }) : res.status(404).json({ message: 'Not found' })));
		}
	} catch (error) {
		Log.error(error);
		res.status(500).json({ error });
	}
};

const updateQue = async (req: Request, res: Response) => {
	const queId = req.params.queId;

	return await Que.findById(queId)
		.then((que) => {
			if (que) {
				que.set(req.body);
				return que.save().then((que) => {
					updateQuePanel();
					res.status(201).json({ que });
				});
			} else {
				res.status(404).json({ message: 'Not found' });
			}
		})
		.catch((error) => res.status(500).json({ error }));
};

const shiftQue = async (req: Request, res: Response) => {
	const queId = req.params.queId;

	return await Que.findById(queId)
		.then((que) => {
			if (que) {
				const shiftedTicket = que.activeTickets.shift();
				return que.save().then((que) => {
					updateQuePanel();
					res.status(201).json({ shiftedTicket });
				});
			} else {
				res.status(404).json({ message: 'Not found' });
			}
		})
		.catch((error) => res.status(500).json({ error }));
};

const deleteQue = async (req: Request, res: Response) => {
	const queId = req.params.queId;
	try {
		const que = await Que.findByIdAndDelete(queId);
		updateQuePanel();
		return que ? res.status(201).json({ message: `Deleted que: ${queId}` }) : res.status(404).json({ message: 'Not found' });
	} catch (error) {
		Log.error(error);
		return res.status(500).json({ error });
	}
};

export default { createQue, readQue, readAllQues, updateQue, shiftQue, deleteQue, queEventsHandler, updateQuePanel };
