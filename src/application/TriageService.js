import { CATEGORIES } from '../domain/ports.js';

// Guardrail 1: higieniza PII antes de enviar ao modelo.
export function sanitizePII(text) {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[EMAIL]')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF]');
}

// Guardrail 2: valida a saída estruturada do modelo (schema); fallback seguro.
export function validateClassification(out) {
  const ok = out && CATEGORIES.includes(out.category)
    && typeof out.confidence === 'number' && out.confidence >= 0 && out.confidence <= 1;
  return ok ? out : { category: 'GERAL', confidence: 0 };
}

export class TriageService {
  constructor(classifier, inventory) {
    this.classifier = classifier; // ClassifierPort
    this.inventory = inventory;   // InventoryPort
  }
  async triage(ticket, assetId) {
    const raw = await this.classifier.classify(sanitizePII(ticket.description));
    const { category } = validateClassification(raw);
    let asset = null;
    try { asset = await this.inventory.getAsset(assetId); }
    catch { asset = null; } // degradação graciosa se o legado estiver fora
    ticket.triage(category);
    return { category, asset };
  }
}
