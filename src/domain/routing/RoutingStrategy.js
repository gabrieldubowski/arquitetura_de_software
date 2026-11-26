// GoF Strategy: regra de escolha do consultor. Nova regra = nova classe (OCP).
export class RoutingStrategy {
  /** @returns {Consultant|null} */
  choose(ticket, consultants) { throw new Error('abstract'); }
}

// Prioriza: disponível > habilidade para a categoria > mesma região.
export class SkillLocationAvailabilityStrategy extends RoutingStrategy {
  choose(ticket, consultants, storeRegion) {
    const score = (c) => (c.skills.includes(ticket.category) ? 2 : 0) + (c.region === storeRegion ? 1 : 0);
    return consultants
      .filter((c) => c.available)
      .sort((a, b) => score(b) - score(a))[0] ?? null;
  }
}

// Alternativa trocável sem alterar o serviço: o primeiro disponível.
export class FirstAvailableStrategy extends RoutingStrategy {
  choose(ticket, consultants) { return consultants.find((c) => c.available) ?? null; }
}
