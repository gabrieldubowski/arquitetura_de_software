import { OpenState } from './TicketState.js';

export class Ticket {
  constructor(id, description) {
    this.id = id;
    this.description = description;
    this.category = null;
    this.technician = null;
    this.history = [];
    this.state = new OpenState();
  }
  get status() { return this.state.name; }
  setState(state) {
    this.history.push(`${this.state.name} -> ${state.name}`);
    this.state = state;
  }
  triage(category) { this.state.triage(this, category); return this; }
  assign(technician) { this.state.assign(this, technician); return this; }
  start() { this.state.start(this); return this; }
  resolve() { this.state.resolve(this); return this; }
  close() { this.state.close(this); return this; }
  reopen() { this.state.reopen(this); return this; }
}
