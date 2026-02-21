import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateCertificate } from '../utils/generateCertificate.js';
import { sendEmail } from '../utils/sendEmail.js';

/**
 * POST /api/certificates/:eventId/send
 * Accessible by: ngo (owns the event) OR coordinator (assigned to the event)
 *
 * Sends a participation certificate (PDF) by email to every volunteer
 * whose registration status is 'attended'.
 */
export const sendCertificates = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { role, _id: userId } = req.user;

  // ── Fetch event and verify ownership/assignment ──────────────────────────
  const query = role === 'ngo'
    ? { _id: eventId, ngoId: userId }
    : { _id: eventId, coordinatorId: userId };

  const event = await Event.findOne(query).populate('ngoId', 'name organization').lean();

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found or you do not have access to it',
    });
  }

  // ── Resolve NGO name ─────────────────────────────────────────────────────
  const ngoName =
    event.ngoId?.organization ||
    event.ngoId?.name ||
    'NGO';

  // ── Find all attended registrations ──────────────────────────────────────
  const registrations = await Registration.find({
    eventId: event._id,
    status: 'attended',
  })
    .populate('volunteerId', 'name email')
    .lean();

  if (registrations.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No attended volunteers found for this event. No certificates were sent.',
      sent: 0,
      failed: 0,
    });
  }

  // ── Send certificates ─────────────────────────────────────────────────────
  let sent = 0;
  let failed = 0;
  const errors = [];

  for (const reg of registrations) {
    const volunteer = reg.volunteerId;
    if (!volunteer?.email) {
      failed++;
      continue;
    }

    try {
      const pdfBuffer = await generateCertificate({
        volunteerName: volunteer.name || 'Volunteer',
        eventName: event.title,
        eventDate: event.date,
        ngoName,
      });

      const sanitizedEventName = event.title.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
      const filename = `Certificate_${sanitizedEventName}.pdf`;

      await sendEmail({
        to: volunteer.email,
        subject: `Your Participation Certificate – ${event.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
            <h2 style="color:#16a34a;margin-bottom:8px;">Congratulations, ${volunteer.name || 'Volunteer'}!</h2>
            <p style="color:#374151;line-height:1.6;">
              Thank you for your valuable contribution as a volunteer at
              <strong>${event.title}</strong>
              ${event.date ? `on <strong>${new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>` : ''}.
            </p>
            <p style="color:#374151;line-height:1.6;">
              Please find your certificate of participation attached to this email.
            </p>
            <p style="color:#6b7280;font-size:13px;margin-top:24px;">
              Issued by <strong>${ngoName}</strong>
            </p>
          </div>
        `,
        attachmentBuffer: pdfBuffer,
        attachmentName: filename,
      });

      sent++;
    } catch (err) {
      failed++;
      errors.push({ email: volunteer.email, error: err.message });
    }
  }

  return res.status(200).json({
    success: true,
    message: `Certificates sent: ${sent}${failed > 0 ? `, failed: ${failed}` : ''}.`,
    sent,
    failed,
    ...(errors.length > 0 && { errors }),
  });
});
