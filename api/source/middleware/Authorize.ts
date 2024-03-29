import { NextFunction, Request, Response } from 'express';

export const isAuthorized = (role: String) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const roles: any = req.user;
		if (roles.roles.includes(role)) {
			next();
		} else {
			res.status(401).json({ message: 'Unathorized' });
		}
	};
};
