// scripts/gen-icons.mjs — يولّد أيقونات PNG/ICO/apple من app/icon.svg
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const svg = 'app/icon.svg';
mkdirSync('public/icons', { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}
await sharp(svg, { density: 384 }).resize(180, 180).png().toFile('app/apple-icon.png');

// favicon.ico بصيغة PNG-embedded (مدعومة في كل المتصفحات الحديثة)
const png = await sharp(svg, { density: 384 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type = icon
header.writeUInt16LE(1, 4); // count
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // width
entry.writeUInt8(32, 1); // height
entry.writeUInt8(0, 2); // colors
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bit count
entry.writeUInt32LE(png.length, 8); // bytes in resource
entry.writeUInt32LE(22, 12); // offset
writeFileSync('app/favicon.ico', Buffer.concat([header, entry, png]));

console.log('icons generated');
