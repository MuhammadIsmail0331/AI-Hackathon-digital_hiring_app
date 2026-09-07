const fs = require('fs');
const p = 'prisma/schema.prisma';
let s = fs.readFileSync(p, 'utf8');
const added = [];
function insModel(name, fields) {
  const re = new RegExp('(model ' + name + ' \\{[\\s\\S]*?\\n})');
  const m = s.match(re);
  if (!m) { console.log('MISS model ' + name); return; }
  let block = m[1]; let add = '';
  for (const f of fields) if (!block.includes(f.key)) add += '  ' + f.line + '\n';
  if (add) { s = s.replace(re, block.replace(/\n}$/, '\n' + add + '}')); added.push(name + ': ' + add.trim().replace(/\n/g, ' | ')); }
}
insModel('User', [
  { key: 'avatarUrl', line: 'avatarUrl String?' },
  { key: 'relation("ChatFrom")', line: 'chatFrom ChatMessage[] @relation("ChatFrom")' },
  { key: 'relation("ChatTo")', line: 'chatTo ChatMessage[] @relation("ChatTo")' },
]);
insModel('WorkerProfile', [{ key: 'portfolioJson', line: 'portfolioJson String?' }]);
if (!s.includes('model ChatMessage')) {
  s += '\nmodel ChatMessage {\n  id        String    @id @default(cuid())\n  fromId    String\n  toId      String\n  body      String\n  createdAt DateTime  @default(now())\n  readAt    DateTime?\n  from      User      @relation("ChatFrom", fields: [fromId], references: [id])\n  to        User      @relation("ChatTo", fields: [toId], references: [id])\n\n  @@index([fromId, toId])\n  @@index([toId, readAt])\n}\n';
  added.push('model ChatMessage');
}
fs.writeFileSync(p, s);
console.log('SCHEMA ADDED:', added.join(' ; ') || 'nothing (already present)');
