import { Controller } from 'stimulus';
import { compareAsc, format, isAfter, parseISO } from 'date-fns';

export default class extends Controller {
  static targets = ['button', 'event'];

  connect() {
    this.enableButton(true);
  }

  run() {
    this.enableButton(false);
    this.render([]);

    fetch('https://p0.dystopiarisingnetwork.com/api/events')
      .then((res) => res.json())
      .then((data) => {
        this.render(data);
        this.enableButton(true);
      });
  }

  render(data) {
    this.eventTarget.innerHTML = data
      .filter(x => isAfter(parseISO(x.starts_at), new Date()))
      .sort((a, b) => this.sortUnformattedDate(a.starts_at, b.starts_at))
      .slice(0, 16)
      .map(
        (x) =>
          `
        <tr>
          <td>${x.id}</td>
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
    this.buttonTarget.textContent = val ? 'Fetch' : 'Fetching...';
  }

  sortUnformattedDate(a, b) {
    return compareAsc(parseISO(a.starts_at), parseISO(b.starts_at));
  }
}
