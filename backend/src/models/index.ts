// User and Authentication Models

export { User } from './User';
export type { IUser } from './User';

export { AlumniProfile } from './AlumniProfile';
export type { IAlumniProfile } from './AlumniProfile';


// Mentorship Models

export {
  Mentorship,               // ✅ Added this export
  MentorshipConnection,
  MentorProfile,
  MenteeProfile
} from './Mentorship';

export type {
  IMentorshipConnection,
  IMentorProfile,
  IMenteeProfile
} from './Mentorship';

// ==============================
// Event Models
// ==============================
export { Event, EventRegistration } from './Event';
export type { IEvent, IEventRegistration } from './Event';

// ==============================
// Donation Models
// ==============================
export { Donation, Campaign } from './Donation';
export type { IDonation, ICampaign } from './Donation';

// ==============================
// Communication Models
// ==============================
export { Communication, CommunicationTemplate } from './Communication';
export type { ICommunication, ICommunicationTemplate } from './Communication';