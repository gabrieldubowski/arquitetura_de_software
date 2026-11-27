import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { InventoryPort, ClassifierPort } from '../src/domain/ports.js';
import { LegacyInventoryAdapter } from '../src/infrastructure/LegacyInventoryAdapter.js';
import { ModelTieringClassifier } from '../src/infrastructure/ModelTieringClassifier.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
function files(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : e.name.endsWith('.js') ? [path.join(dir,e.name)] : []); }
function dependencies(file) {
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(m => m[1]).filter(p => p.startsWith('.')).map(p => path.resolve(path.dirname(file),p));
}
function forbid(layer, banned) {
  const actual = files(path.join(root,layer)); assert.ok(actual.length > 0);
  for(const f of actual) for(const dep of dependencies(f)) for(const b of banned) {
    const base=path.join(root,b)+path.sep;
    assert.ok(!dep.startsWith(base), `${path.relative(root,f)} depende indevidamente de ${path.relative(root,dep)}`);
  }
}
test('domínio não importa infraestrutura nem aplicação', () => forbid('domain',['infrastructure','application']));
test('aplicação não importa infraestrutura', () => forbid('application',['infrastructure']));
test('adapter de inventário implementa a porta', () => assert.ok(LegacyInventoryAdapter.prototype instanceof InventoryPort));
test('classificador implementa a porta', () => assert.ok(ModelTieringClassifier.prototype instanceof ClassifierPort));
// Fitness functions locais por inspeção de imports estáticos. Não são ArchUnit nem cobrem imports dinâmicos.
