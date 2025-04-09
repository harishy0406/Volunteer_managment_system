// Update volunteer limit for an event
function updateVolunteerLimit(eventId, newLimit) {
    const events = JSON.parse(localStorage.getItem('events'));
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
        events[eventIndex].volunteersNeeded = newLimit;
        localStorage.setItem('events', JSON.stringify(events));
        
        document.getElementById('max-volunteers').textContent = newLimit;
        alert('Volunteer limit updated successfully!');
    }
}

// Remove volunteer from event
function removeVolunteer(eventId, volunteerId) {
    if (!confirm('Are you sure you want to remove this volunteer?')) return;
    
    const events = JSON.parse(localStorage.getItem('events'));
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
        const event = events[eventIndex];
        const volunteerIndex = event.volunteers.indexOf(volunteerId);
        
        if (volunteerIndex !== -1) {
            event.volunteers.splice(volunteerIndex, 1);
            localStorage.setItem('events', JSON.stringify(events));
            
            document.getElementById('current-volunteers').textContent = event.volunteers.length;
            displayVolunteers(event.volunteers);
            alert('Volunteer removed successfully!');
        }
    }
}