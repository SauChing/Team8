import { Router, Request, Response } from 'express';
import { MakanLunchSession, Participant, VoteType } from '../../src/types/makan';

export const sessionsRouter = Router();

// In-memory persistent session store for cross-device synchronization
const sessionsStore: Map<string, MakanLunchSession> = new Map();

sessionsRouter.post('/', (req: Request, res: Response) => {
  const { title, meetingArea, lunchTime, expectedGroupSize, organiserName } = req.body;
  const id = `lunch-${Date.now().toString(36)}`;

  const newSession: MakanLunchSession = {
    id,
    title: title || 'Office Team Lunch',
    meetingArea: meetingArea || 'Tanjong Pagar / CBD',
    lunchTime: lunchTime || 'Today, 12:30 PM',
    expectedGroupSize: expectedGroupSize || 4,
    organiserName: organiserName || 'Alex',
    participants: [
      {
        id: `p-${Date.now()}`,
        name: organiserName || 'Alex',
        isOrganiser: true,
        isReady: true,
        budgetMax: 25,
        requiresHalal: false,
        requiresVegetarian: false,
        noBeef: false,
        noPork: false,
        preferredCuisines: ['Healthy / Grain Bowls', 'Japanese'],
      },
    ],
    votes: {},
    status: 'joining',
    createdAt: new Date().toISOString(),
  };

  sessionsStore.set(id, newSession);
  res.json({ session: newSession });
});

sessionsRouter.get('/:id', (req: Request, res: Response) => {
  const session = sessionsStore.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Lunch session not found' });
  }
  res.json({ session });
});

sessionsRouter.post('/:id/join', (req: Request, res: Response) => {
  const session = sessionsStore.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const participant: Participant = req.body.participant;
  const existingIdx = session.participants.findIndex((p) => p.id === participant.id);

  if (existingIdx >= 0) {
    session.participants[existingIdx] = participant;
  } else {
    session.participants.push(participant);
  }

  sessionsStore.set(session.id, session);
  res.json({ session });
});

sessionsRouter.post('/:id/vote', (req: Request, res: Response) => {
  const session = sessionsStore.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { venueId, participantId, vote } = req.body as {
    venueId: string;
    participantId: string;
    vote: VoteType;
  };

  if (!session.votes[venueId]) {
    session.votes[venueId] = {};
  }
  session.votes[venueId][participantId] = vote;

  sessionsStore.set(session.id, session);
  res.json({ session });
});

sessionsRouter.post('/:id/confirm', (req: Request, res: Response) => {
  const session = sessionsStore.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.confirmedVenueId = req.body.venueId;
  session.status = 'settled';
  sessionsStore.set(session.id, session);
  res.json({ session });
});
