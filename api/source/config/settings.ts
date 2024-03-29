//====================================================================
// SETTINGS FOR WORKDAYS
//====================================================================

const DAY_COUNT = 90;
const WORKDAY_START = 480; // in minutes from midnight, 480 -> 8:00
const WORKDAY_END = 900; // in minutes from midnight, 900 -> 15:00
const SLOT_DURATION = 30; // in minutes

export const workdaySettings = {
	days: {
		dayCount: DAY_COUNT,
		start: WORKDAY_START,
		end: WORKDAY_END
	},
	slot: {
		duration: SLOT_DURATION
	}
};

export const holidays = ['01-01', '01-06', '05-01', '05-03', '08-15', '11-01', '11-11', '12-25', '12-26'];

//====================================================================
// SETTINGS FOR CRONJOBS
// It is possible to add more parameters and objects to cronSettings
// object to set different settings for each cron job.
//====================================================================

const TIME_OF_UPDATE_HOUR = 7; // hours 0-23
const TIME_OF_UPDATE_MINUTES = 0; // minutes 0-59

const TIME_OF_DELETE_HOUR = 7; // hours 0-23
const TIME_OF_DELETE_MINUTES = 0; // minutes 0-59

export const cronSettings = {
	updateDayArray: {
		hour: TIME_OF_UPDATE_HOUR,
		minutes: TIME_OF_UPDATE_MINUTES
	},
	deleteOutdatedReservations: {
		hour: TIME_OF_DELETE_HOUR,
		minutes: TIME_OF_DELETE_MINUTES
	}
};

//====================================================================
// SETTINGS FOR TICKETS
//====================================================================
const FIRST_IN_QUE_THESHOLD = 20; //minutes threshold after which ticket is directed to last index
export const lateThreshold = FIRST_IN_QUE_THESHOLD;

//====================================================================
// SETTINGS FOR ROLES
//====================================================================
export const ROLES = {
	admin: 'admin',
	staff: 'staff',
	doctor: 'doctor'
};

export const FRONTEND_BASE_URL = 'http://localhost:3030';

export const RESERVATION_CODE_LENGTH = 5;
