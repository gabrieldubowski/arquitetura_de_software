import { InventoryPort } from '../domain/ports.js';

// Simula o sistema legado de inventário, que só fala XML.
export class LegacyInventoryClient {
  async executeQuery(xml) {
    const id = /<assetId>(.*?)<\/assetId>/.exec(xml)[1];
    return `<asset><assetId>${id}</assetId><model>Dell-7420</model><warranty>true</warranty></asset>`;
  }
}

// GoF Adapter + ACL: traduz XML legado <-> DTO do domínio.
export class LegacyInventoryAdapter extends InventoryPort {
  constructor(legacyClient) { super(); this.legacy = legacyClient; }
  async getAsset(assetId) {
    const xml = await this.legacy.executeQuery(`<query><assetId>${assetId}</assetId></query>`);
    const tag = (t) => new RegExp(`<${t}>(.*?)</${t}>`).exec(xml)?.[1];
    return { assetId: tag('assetId'), model: tag('model'), warranty: tag('warranty') === 'true' };
  }
}
