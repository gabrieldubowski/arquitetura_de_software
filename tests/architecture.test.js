// Fitness Functions (equivalente ao ArchUnit em JS): regras de dependência verificadas a cada build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.js') ? [p] : [];
  });
}
const importsOf = (file) =>
  [...readFileSync(file, 'utf8').matchAll(/from\s+['"](.+?)['"]/g)].map((m) => m[1]);

function assertNoImport(dir, forbidden) {
  for (const f of files(dir))
    for (const imp of importsOf(f))
      assert.ok(!imp.includes(forbidden), `${f} importa "${imp}" (proibido: ${forbidden})`);
}

test('Regra 1: Domínio não depende de Infraestrutura', () => assertNoImport('src/domain', 'infrastructure'));
test('Regra 2: Domínio não depende de Aplicação', () => assertNoImport('src/domain', 'application'));
test('Regra 3: Aplicação não depende de Infraestrutura (só de portas)', () => assertNoImport('src/application', 'infrastructure'));
test('Regra 4: toda implementação de porta estende uma abstração do domínio', () => {
  for (const f of files('src/infrastructure')) {
    const src = readFileSync(f, 'utf8');
    if (/class \w+(Adapter|Classifier)\b/.test(src) && !/Client|Local|Cloud/.test(src.match(/class (\w+)/)[1]))
      assert.match(src, /extends (InventoryPort|ClassifierPort)/, f);
  }
});
