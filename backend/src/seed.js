import 'dotenv/config';
import { connectDB } from './config/db.js';
import { User } from './models/User.model.js';
import { Event } from './models/Event.model.js';
import { Registration } from './models/Registration.model.js';

await connectDB();

const seed = async () => {
  try {
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();

    const ngo = await User.create({
      name: 'Helping Hands NGO',
      email: 'ngo@test.com',
      password: '123456',
      role: 'ngo',
      organization: 'Helping Hands',
    });

    const coordinator = await User.create({
      name: 'Event Coordinator',
      email: 'coord@test.com',
      password: '123456',
      role: 'coordinator',
      organization: 'Helping Hands',
    });

    const volunteers = await User.insertMany([
      {
        name: 'HrushikeshVolunteer',
        email: 'v1@test.com',
        password: '123456',
        role: 'volunteer',
      },
      {
        name: 'VedantVolunteer',
        email: 'v2@test.com',
        password: '123456',
        role: 'volunteer',
      },
      {
        name: 'Volunteer 3',
        email: 'v3@test.com',
        password: '123456',
        role: 'volunteer',
      },
    ]);

    const event1 = await Event.create({
      title: 'Tree Plantation Drive',
      description: 'Planting trees in city park',
      location: 'Central Park, Mumbai',
      ngoId: ngo._id,
      coordinatorId: coordinator._id,
      date: new Date(),
      volunteersRequired: 20,
      mode: 'Offline',
    });

    await Registration.insertMany(
      volunteers.map((v) => ({
        volunteerId: v._id,
        eventId: event1._id,
        status: 'pending',
      }))
    );

    await Event.findByIdAndUpdate(event1._id, {
      registeredVolunteers: volunteers.map((v) => v._id),
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
