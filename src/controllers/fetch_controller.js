import { Controller } from 'stimulus';
import { compareAsc, format, isAfter, parseISO } from 'date-fns';

export default class extends Controller {
  static targets = ['button', 'event', 'tickets', 'eventName'];

  connect() {
    this.enableButton(true);
  }

  run() {
    this.enableButton(false);
    this.renderEvents([]);

    fetch('https://p0.dystopiarisingnetwork.com/api/events')
      .then((res) => res.json())
      .then((data) => {
        this.renderEvents(data);
        this.enableButton(true);
      });
  }

  getEvent(el) {
    const eventId = el.target.dataset.eventId;

    this.renderTickets(null);
    this.eventNameTarget.textContent = el.target.dataset.eventName;

    fetch(`https://p0.dystopiarisingnetwork.com/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        this.renderTickets(data);
      });
  }

  renderTickets(data) {
    if (!data) return (this.ticketsTarget.innerHTML = 'Fetching Tickets...');

    this.ticketsTarget.innerHTML = data.tickets
      .filter((x) => !x.fully_booked)
      .filter((x) => x.limit)
      .map(
        (x) =>
          `
        <div>
          <div>
            $${x.cost} - ${x.label} [${x.event_attendees_count} / ${x.limit ||
            'unlimited'}]
          </div>
        </div>
      `
      )
      .join('');
  }

  renderEvents(data) {
    this.eventTarget.innerHTML = data
      .filter((x) => isAfter(parseISO(x.starts_at), new Date()))
      .sort((a, b) => this.sortUnformattedDate(a.starts_at, b.starts_at))
      .slice(0, 16)
      .map(
        (x) =>
          `
        <tr>
          <td
            data-action='click->fetch#getEvent'
            data-event-id=${x.id}
            data-event-name='${x.name}'
            class='clickable'
          >
            ${x.id}
          </td>
          <td>${x.branch.name}</td>
          <td>${x.name}</td>
          <td>${format(parseISO(x.starts_at), 'yyyy-M-d')}</td>
        </tr>
      `
      )
      .join('');
  }

  enableButton(val) {
    this.buttonTarget.disabled = !val;
    this.buttonTarget.textContent = val ? 'Fetch Events' : 'Fetching...';
  }

  sortUnformattedDate(a, b) {
    return compareAsc(parseISO(a.starts_at), parseISO(b.starts_at));
  }
}
