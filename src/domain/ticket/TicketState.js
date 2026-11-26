// GoF State: cada estado conhece as transições válidas do chamado.
export class IllegalTransitionError extends Error {}

export class TicketState {
  get name() { throw new Error('abstract'); }
  #deny(action) {
    throw new IllegalTransitionError(`Ação "${action}" inválida no estado ${this.name}`);
  }
  triage(ticket, category) { this.#deny('triage'); }
  assign(ticket, technician) { this.#deny('assign'); }
  start(ticket) { this.#deny('start'); }
  resolve(ticket) { this.#deny('resolve'); }
  close(ticket) { this.#deny('close'); }
  reopen(ticket) { this.#deny('reopen'); }
}

export class OpenState extends TicketState {
  get name() { return 'ABERTO'; }
  triage(ticket, category) { ticket.category = category; ticket.setState(new TriagedState()); }
}
export class TriagedState extends TicketState {
  get name() { return 'TRIADO'; }
  assign(ticket, technician) { ticket.technician = technician; ticket.setState(new AssignedState()); }
}
export class AssignedState extends TicketState {
  get name() { return 'ATRIBUIDO'; }
  start(ticket) { ticket.setState(new InProgressState()); }
}
export class InProgressState extends TicketState {
  get name() { return 'EM_ATENDIMENTO'; }
  resolve(ticket) { ticket.setState(new ResolvedState()); }
}
export class ResolvedState extends TicketState {
  get name() { return 'RESOLVIDO'; }
  close(ticket) { ticket.setState(new ClosedState()); }
  reopen(ticket) { ticket.setState(new InProgressState()); }
}
export class ClosedState extends TicketState {
  get name() { return 'FECHADO'; }
}
