import { ClassifierPort } from '../domain/ports.js';

const RULES = {
  HARDWARE: /(tela|teclado|mouse|notebook|impressora|monitor)/i,
  REDE: /(wifi|internet|vpn|rede|conex)/i,
  ACESSO: /(senha|login|acesso|bloquead)/i,
  SOFTWARE: /(instal|erro|app|sistema|travando)/i,
};

// Tier 1: SLM local (aqui simulado por regras) - barato e rápido.
export class LocalSlmClassifier extends ClassifierPort {
  async classify(text) {
    for (const [category, re] of Object.entries(RULES)) if (re.test(text)) return { category, confidence: 0.9 };
    return { category: 'GERAL', confidence: 0.3 };
  }
}
// Tier 2: LLM em nuvem (simulado) - usado só quando o SLM tem baixa confiança.
export class CloudLlmClassifier extends ClassifierPort {
  async classify() { return { category: 'GERAL', confidence: 0.8 }; }
}

export class ModelTieringClassifier extends ClassifierPort {
  constructor(local = new LocalSlmClassifier(), cloud = new CloudLlmClassifier(), minConfidence = 0.7) {
    super(); Object.assign(this, { local, cloud, minConfidence });
  }
  async classify(text) {
    const first = await this.local.classify(text);
    return first.confidence >= this.minConfidence ? first : this.cloud.classify(text);
  }
}
