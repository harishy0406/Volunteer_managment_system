// events.js - Volunteer Management System Event Functions

/**
 * Initialize event-related storage if empty
 */
function initializeEventStorage() {
    if (!localStorage.getItem('events')) {
        localStorage.setItem('events', JSON.stringify([]));
    }
}

/**
 * Display events for organizers
 * @param {Array} events - Array of event objects
 */
function displayOrganizerEvents(events) {
    const eventsGrid = document.getElementById('organizer-events');
    
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-plus"></i>
                <p>You haven't created any events yet</p>
                <button id="create-first-event" class="btn-primary">Create Your First Event</button>
            </div>
        `;
        return;
    }
    
    eventsGrid.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = createEventCard(event, true);
        eventsGrid.appendChild(eventCard);
    });
}

/**
 * Display events for volunteers
 * @param {Array} events - Array of event objects
 */
function displayVolunteerEvents(events) {
    const eventsGrid = document.getElementById('volunteer-events');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times"></i>
                <p>No events available at the moment</p>
            </div>
        `;
        return;
    }
    
    eventsGrid.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = createEventCard(event, false, currentUser);
        eventsGrid.appendChild(eventCard);
    });
}

/**
 * Create an event card element
 * @param {Object} event - Event object
 * @param {Boolean} isOrganizer - Whether the viewer is an organizer
 * @param {Object} currentUser - Current user object (for volunteer view)
 * @returns {HTMLElement} Event card element
 */
function createEventCard(event, isOrganizer, currentUser = null) {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    
    if (isOrganizer) {
        eventCard.innerHTML = getOrganizerEventCardHTML(event);
    } else {
        const isRegistered = currentUser ? event.volunteers.includes(currentUser.id) : false;
        const isFull = event.volunteers.length >= event.volunteersNeeded;
        const canJoin = !isRegistered && !isFull && (event.status === 'active' || !event.status);
        
        eventCard.innerHTML = getVolunteerEventCardHTML(event, isRegistered, isFull, canJoin);
    }
    
    // Add event listeners
    const viewBtn = eventCard.querySelector('.view-btn');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            window.location.href = `event-detail.html?id=${event.id}`;
        });
    }
    
    if (!isOrganizer) {
        const joinBtn = eventCard.querySelector('.join-btn');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => {
                registerForEvent(event.id, currentUser.id);
            });
        }
    } else {
        const manageBtn = eventCard.querySelector('.manage-btn');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                window.location.href = `event-detail.html?id=${event.id}`;
            });
        }
    }
    
    return eventCard;
}

/**
 * Get HTML for organizer event card
 * @param {Object} event - Event object
 * @returns {String} HTML string
 */
function getOrganizerEventCardHTML(event) {
    return `
        <div class="event-card-image" style="background-image: url('${event.image || 'https://via.placeholder.com/800x400'}')"></div>
        <div class="event-card-content">
            <h3 class="event-card-title">${event.title}</h3>
            <div class="event-card-meta">
                <span><i class="fas fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
            </div>
            <p class="event-card-description">${event.description}</p>
            <div class="event-card-actions">
                <span><i class="fas fa-users"></i> ${event.volunteers.length}/${event.volunteersNeeded}</span>
                <span class="event-status-badge ${event.status || 'active'}">${event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Active'}</span>
                <button class="btn-primary manage-btn" data-id="${event.id}">Manage</button>
            </div>
        </div>
    `;
}

/**
 * Get HTML for volunteer event card
 * @param {Object} event - Event object
 * @param {Boolean} isRegistered - Whether user is registered
 * @param {Boolean} isFull - Whether event is full
 * @param {Boolean} canJoin - Whether user can join
 * @returns {String} HTML string
 */
function getVolunteerEventCardHTML(event, isRegistered, isFull, canJoin) {
    return `
        <div class="event-card-image" style="background-image: url('${event.image || 'https://via.placeholder.com/800x400'}')"></div>
        <div class="event-card-content">
            <h3 class="event-card-title">${event.title}</h3>
            <div class="event-card-meta">
                <span><i class="fas fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
            </div>
            <p class="event-card-description">${event.description}</p>
            <div class="event-card-actions">
                <span><i class="fas fa-users"></i> ${event.volunteers.length}/${event.volunteersNeeded}</span>
                <button class="btn-primary view-btn" data-id="${event.id}">View Details</button>
                ${canJoin ? `<button class="btn-accent join-btn" data-id="${event.id}">Join Event</button>` : ''}
                ${isRegistered ? `<button class="btn-secondary" disabled>Joined</button>` : ''}
                ${isFull ? `<button class="btn-secondary" disabled>Event Full</button>` : ''}
            </div>
        </div>
    `;
}

/**
 * Create a new event
 */
function createEvent() {
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const location = document.getElementById('event-location').value;
    const volunteersNeeded = parseInt(document.getElementById('event-volunteers').value);
    const imageFile = document.getElementById('event-image').files[0];
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const newEvent = {
        id: 'evt' + Date.now(),
        title,
        description,
        date,
        time,
        location,
        volunteersNeeded,
        volunteers: [],
        organizerId: currentUser.id,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newEvent.image = e.target.result;
            saveEvent(newEvent);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveEvent(newEvent);
    }
}

/**
 * Save event to storage
 * @param {Object} event - Event object to save
 */
function saveEvent(event) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
    
    alert('Event created successfully!');
    document.getElementById('create-event-modal').style.display = 'none';
    
    // Refresh the display
    if (window.location.pathname.endsWith('organizer-dash.html')) {
        const organizerId = JSON.parse(localStorage.getItem('currentUser')).id;
        const organizerEvents = events.filter(e => e.organizerId === organizerId);
        displayOrganizerEvents(organizerEvents);
    }
}

/**
 * Register volunteer for an event
 * @param {String} eventId - ID of the event
 * @param {String} volunteerId - ID of the volunteer
 */
function registerForEvent(eventId, volunteerId) {
    const events = JSON.parse(localStorage.getItem('events'));
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
        alert('Event not found!');
        return;
    }
    
    const event = events[eventIndex];
    
    // Check event status
    if (event.status && event.status !== 'active') {
        alert(`This event has been ${event.status} and cannot accept new volunteers.`);
        return;
    }
    
    if (event.volunteers.length >= event.volunteersNeeded) {
        alert('This event is already full!');
        return;
    }
    
    if (event.volunteers.includes(volunteerId)) {
        alert('You are already registered for this event!');
        return;
    }
    
    event.volunteers.push(volunteerId);
    localStorage.setItem('events', JSON.stringify(events));
    
    alert('You have successfully registered for this event!');
    
    // Refresh the display
    if (window.location.pathname.endsWith('volunteer-dash.html')) {
        const filteredEvents = filterEventsByStatus(events, 'active');
        displayVolunteerEvents(filteredEvents);
    } else if (window.location.pathname.endsWith('event-detail.html')) {
        window.location.reload();
    }
}

/**
 * Update event status
 * @param {String} eventId - ID of the event
 * @param {String} status - New status ('active', 'cancelled', 'completed')
 */
function updateEventStatus(eventId, status) {
    const events = JSON.parse(localStorage.getItem('events'));
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
        alert('Event not found!');
        return false;
    }
    
    events[eventIndex].status = status;
    localStorage.setItem('events', JSON.stringify(events));
    
    // Refresh the display
    if (window.location.pathname.endsWith('organizer-dash.html')) {
        const organizerId = JSON.parse(localStorage.getItem('currentUser')).id;
        const organizerEvents = events.filter(e => e.organizerId === organizerId);
        displayOrganizerEvents(organizerEvents);
    }
    
    return true;
}

/**
 * Delete an event
 * @param {String} eventId - ID of the event to delete
 */
function deleteEvent(eventId) {
    let events = JSON.parse(localStorage.getItem('events'));
    const initialLength = events.length;
    
    events = events.filter(e => e.id !== eventId);
    
    if (events.length === initialLength) {
        alert('Event not found!');
        return false;
    }
    
    localStorage.setItem('events', JSON.stringify(events));
    
    // Redirect if on event detail page
    if (window.location.pathname.endsWith('event-detail.html') || 
        window.location.pathname.endsWith('manage-volunteers.html')) {
        window.location.href = 'organizer-dash.html';
    }
    
    return true;
}

/**
 * Filter events by status
 * @param {Array} events - Array of events
 * @param {String} status - Status to filter by
 * @returns {Array} Filtered events
 */
function filterEventsByStatus(events, status) {
    return events.filter(event => 
        status === 'all' ? true : (event.status || 'active') === status
    );
}

/**
 * Format date for display
 * @param {String} dateString - Date string to format
 * @returns {String} Formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize event storage when loaded
document.addEventListener('DOMContentLoaded', initializeEventStorage);

/**
 * Get events that a specific volunteer has registered for
 * @param {String} volunteerId - ID of the volunteer
 * @returns {Array} Array of event objects
 */
function getVolunteerEvents(volunteerId) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    return events.filter(event => event.volunteers.includes(volunteerId));
}