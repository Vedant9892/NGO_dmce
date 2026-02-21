/**
 * Platform Knowledge Base for RAG Chatbot
 * Each chunk has: id, role (who can see it: 'all' | 'volunteer' | 'organizer' | 'admin'),
 * category, title, and content.
 */

export const knowledgeChunks = [
  // ─── GENERAL / ALL ROLES ─────────────────────────────────────────────────
  {
    id: 'general-001',
    role: 'all',
    category: 'general',
    title: 'What is NGO_dmce?',
    content: `NGO_dmce is a web platform that connects volunteers with NGO-organized community events. 
Volunteers can browse events, register, and track their participation history. 
Organizers can create and manage events. Admins oversee the entire platform and generate reports.`,
  },
  {
    id: 'general-002',
    role: 'all',
    category: 'general',
    title: 'Available user roles',
    content: `The platform has three roles:
1. Volunteer – browses and registers for events, views personal dashboard.
2. Organizer (Coordinator) – creates, edits, and manages events; sends notifications; tracks attendance.
3. Admin – full platform access, user management, report generation, stats overview.
Role is selected during registration and determines what pages and features are accessible.`,
  },
  {
    id: 'general-003',
    role: 'all',
    category: 'navigation',
    title: 'Main navigation',
    content: `The top navigation bar contains:
- Home / Landing page
- Events – public listing of all upcoming events
- Login / Register buttons (when not logged in)
- Dashboard (when logged in, shows role-specific dashboard)
- Notifications bell icon (for logged in users)
- Profile / Logout menu`,
  },
  {
    id: 'general-004',
    role: 'all',
    category: 'auth',
    title: 'How to register an account',
    content: `To create an account on NGO_dmce:
1. Click the "Register" button on the top navigation bar or the homepage.
2. Fill in the registration form:
   - Full Name
   - Email address (must be unique)
   - Password (minimum 6 characters)
   - Select your Role: Volunteer, Organizer, or Admin
   - If Organizer, fill in your Organization name
3. Click the "Register" button to submit.
4. You will be automatically logged in and redirected to your dashboard.`,
  },
  {
    id: 'general-005',
    role: 'all',
    category: 'auth',
    title: 'How to log in',
    content: `To log in to NGO_dmce:
1. Click the "Login" button on the navigation bar.
2. Enter your registered Email and Password.
3. Click "Login".
4. You will be redirected to your role-specific dashboard.
If you forget your password, contact the platform administrator.`,
  },
  {
    id: 'general-006',
    role: 'all',
    category: 'events',
    title: 'How to browse events',
    content: `To see all available events:
1. Click "Events" in the navigation bar (accessible without login).
2. The Events Listing page shows all upcoming and active events.
3. Each event card shows: Title, Date, Location, Category, Volunteer slots remaining.
4. Use the search bar or filters to narrow down events by category or date.
5. Click "View Details" on any card to see the full event description.`,
  },

  // ─── VOLUNTEER ────────────────────────────────────────────────────────────
  {
    id: 'vol-001',
    role: 'volunteer',
    category: 'events',
    title: 'How to register for an event',
    content: `To register as a volunteer for an event:
1. Go to the "Events" page from the navigation bar.
2. Browse or search for the event you want to join.
3. Click "View Details" on the event card.
4. On the Event Details page, read the description, requirements, and dates.
5. Click the "Register" button.
6. A registration form will appear — fill in:
   - Your availability (dates/times you are free)
   - Any proof/ID document if required by the event (upload file)
7. Click "Submit Registration".
8. You will see a confirmation message. The event now appears in your dashboard.`,
  },
  {
    id: 'vol-002',
    role: 'volunteer',
    category: 'dashboard',
    title: 'Volunteer Dashboard overview',
    content: `The Volunteer Dashboard is your personal hub. It shows:
- Upcoming events you are registered for
- Past events and participation history
- Your profile stats (events attended, hours contributed)
- Notifications from organizers
To access the dashboard, log in and click "Dashboard" in the navigation bar.`,
  },
  {
    id: 'vol-003',
    role: 'volunteer',
    category: 'events',
    title: 'How to cancel an event registration',
    content: `To cancel your registration for an event:
1. Go to your Volunteer Dashboard.
2. Find the event under "Upcoming Events".
3. Click "Cancel Registration" on that event.
4. Confirm the cancellation in the dialog.
5. The event slot is released back to other volunteers.
Note: Cancellations may not be available within 24 hours of the event start.`,
  },
  {
    id: 'vol-004',
    role: 'volunteer',
    category: 'profile',
    title: 'How to update volunteer profile',
    content: `To edit your profile:
1. Click your name or avatar in the top navigation bar.
2. Select "Profile" from the dropdown.
3. You can update: Full Name, Phone Number, Bio, Skills.
4. Click "Save Changes" when done.`,
  },
  {
    id: 'vol-005',
    role: 'volunteer',
    category: 'notifications',
    title: 'How volunteers receive notifications',
    content: `Volunteers receive notifications when:
- An organizer sends a message about a registered event
- An event you registered for is updated or cancelled
- A new event matching your interests is posted
To view notifications, click the bell icon in the top navigation bar.
Unread notifications are shown with a badge count.`,
  },

  // ─── ORGANIZER / COORDINATOR ──────────────────────────────────────────────
  {
    id: 'org-001',
    role: 'organizer',
    category: 'events',
    title: 'How to create a new event',
    content: `To create a new event (Organizer only):
1. Log in as an Organizer and go to your Coordinator Dashboard.
2. Click the "Create Event" button.
3. Fill in the Create Event form:
   - Event Title (required)
   - Description — explain what the event is about
   - Date and Time (start and end)
   - Location (address or venue name)
   - Category (e.g., Education, Environment, Health)
   - Skills Required (optional — specify skills needed from volunteers)
   - Max Volunteers — set the volunteer capacity limit
   - Upload a banner image (optional)
4. Review all details and click "Create Event" / "Publish".
5. The event is now live on the Events page for volunteers to see.`,
  },
  {
    id: 'org-002',
    role: 'organizer',
    category: 'events',
    title: 'How to edit an existing event',
    content: `To edit an event you created:
1. Go to your Coordinator Dashboard.
2. In the "My Events" section, find the event.
3. Click the "Edit" button (pencil icon) on the event card.
4. An Edit Event modal will open with pre-filled fields.
5. Modify any fields: title, description, date, location, capacity, etc.
6. Click "Save Changes".
7. Registered volunteers will be notified of the update automatically.`,
  },
  {
    id: 'org-003',
    role: 'organizer',
    category: 'events',
    title: 'How to delete or cancel an event',
    content: `To delete or cancel an event:
1. Go to your Coordinator Dashboard → My Events.
2. Find the event and click the "Delete" button (trash icon).
3. Confirm the deletion in the popup dialog.
4. All registered volunteers will receive a cancellation notification.
This action is irreversible. Consider editing the event instead of deleting if only minor changes are needed.`,
  },
  {
    id: 'org-004',
    role: 'organizer',
    category: 'attendance',
    title: 'How to mark volunteer attendance',
    content: `To mark attendance for an event:
1. Open the Coordinator Dashboard.
2. Click "Attendance" or find the event in the Event Attendance Panel.
3. You will see the list of registered volunteers.
4. Check the checkbox next to each volunteer who attended.
5. Click "Save Attendance".
6. Attendance data feeds into volunteer stats and platform reports.`,
  },
  {
    id: 'org-005',
    role: 'organizer',
    category: 'notifications',
    title: 'How to send notifications to volunteers',
    content: `To send a notification to registered volunteers:
1. Go to the Coordinator Dashboard.
2. Find the "Send Notification" panel or button.
3. Select the event for which you want to send a message.
4. Type your notification message in the text box.
5. Click "Send Notification".
6. All volunteers registered for that event will receive the notification in their bell dropdown.`,
  },
  {
    id: 'org-006',
    role: 'organizer',
    category: 'dashboard',
    title: 'Coordinator Dashboard overview',
    content: `The Coordinator Dashboard includes:
- My Events — list of all events you have created with status
- Create Event button
- Attendance Panel — mark volunteer attendance per event
- Send Notification Panel — message volunteers of a specific event
- Stats summary (total events, total volunteers registered)`,
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  {
    id: 'adm-001',
    role: 'admin',
    category: 'dashboard',
    title: 'Admin / NGO Dashboard overview',
    content: `The Admin/NGO Dashboard provides full platform oversight:
- Platform-wide stats: total volunteers, total events, total registrations
- User management: view all users, change roles
- All events listing with edit/delete controls
- Reports and analytics
- Notification management`,
  },
  {
    id: 'adm-002',
    role: 'admin',
    category: 'reports',
    title: 'How to generate volunteer summary reports',
    content: `To generate a volunteer summary report (Admin only):
1. Log in as Admin and go to the NGO Dashboard.
2. Navigate to the "Stats" or "Reports" section.
3. Select the date range or event filter.
4. Click "Generate Report".
5. The report shows: volunteer count, attendance rate, event breakdown.
6. You can export it as CSV or PDF.
This feature is only available to Admin roles.`,
  },
  {
    id: 'adm-003',
    role: 'admin',
    category: 'users',
    title: 'How to manage users',
    content: `To manage users (Admin only):
1. Go to the NGO Dashboard.
2. Click "Users" or "User Management".
3. You can see all registered users with their roles.
4. Use the search bar to find a specific user by name or email.
5. Click on a user to view their profile.
6. You can change their role, deactivate, or delete the account.`,
  },
  {
    id: 'adm-004',
    role: 'admin',
    category: 'stats',
    title: 'Platform statistics and analytics',
    content: `The Stats page (Admin) displays:
- Total registered volunteers
- Total events created (active, past, upcoming)
- Total registrations and attendance rate
- Event category breakdown (pie chart)
- Volunteer growth over time (line chart)
Click the "Stats" link in the Admin Dashboard navigation to access this page.`,
  },

  // ─── COMMON FEATURES ─────────────────────────────────────────────────────
  {
    id: 'common-001',
    role: 'all',
    category: 'notifications',
    title: 'How notifications work',
    content: `The notification system works as follows:
- The bell icon in the top navigation shows unread notification count.
- Click the bell to open the notification dropdown.
- Notifications are marked as read when viewed.
- Organizers send notifications to volunteers via the Coordinator Dashboard.
- System notifications are sent for event updates, cancellations, and confirmations.`,
  },
  {
    id: 'common-002',
    role: 'all',
    category: 'troubleshooting',
    title: 'Common issues and troubleshooting',
    content: `Common issues:
- Cannot log in: Make sure email and password are correct. Passwords are case-sensitive.
- Registration fails: Email may already be in use. Try logging in instead.
- Event not showing: Check if the event date has passed or if it is at capacity.
- Notification not received: Refresh the page or check your role's notification settings.
- Page looks broken: Try clearing browser cache or using a different browser.
For persistent issues, contact the platform admin.`,
  },
];
