import { SkillLocationAvailabilityStrategy } from '../domain/routing/RoutingStrategy.js';

// Roteia um chamado triado. Se ninguém está disponível, o chamado fica
// aguardando (degradação graciosa): o ticket continua registrado.
export class RoutingService {
  constructor(consultants, strategy = new SkillLocationAvailabilityStrategy()) {
    this.consultants = consultants; // lista ou repositório de consultores (RH)
    this.strategy = strategy;
  }
  route(ticket, storeRegion) {
    const chosen = this.strategy.choose(ticket, this.consultants, storeRegion);
    if (!chosen) return { routed: false, reason: 'sem consultor disponível; aguardando' };
    ticket.assign(chosen.id);
    return { routed: true, consultant: chosen.id };
  }
}
