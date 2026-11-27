// Portas (DIP): o domínio declara as abstrações; a infraestrutura implementa.
export class InventoryPort {
  /** @returns {Promise<{assetId:string, model:string, warranty:boolean}>} */
  async getAsset(assetId) { throw new Error('abstract'); }
}
export class ClassifierPort {
  /** @returns {Promise<{category:string, confidence:number}>} */
  async classify(text) { throw new Error('abstract'); }
}
export const CATEGORIES = ['HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO', 'GERAL'];
