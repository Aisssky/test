/**
 * 读图片文件的原始宽高（只读文件头，不解码、不引第三方依赖）。
 *
 * 为什么需要：GAMES 卡片的宽度要跟着封面比例走，就必须知道图是横的、方的还是竖的。
 * 图片放在 public/ 下，astro:assets 拿不到尺寸，所以自己解析文件头。
 *
 * 支持 JPEG / PNG / WebP / GIF，解析不出来就返回 null（调用方用兜底比例）。
 */
import { readFileSync } from 'node:fs';

function jpeg(data: Buffer): [number, number] | null {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) return null;
  let i = 2;
  while (i < data.length - 9) {
    if (data[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = data[i + 1];
    // 无长度字段的标记：SOI / EOI / TEM / RSTn
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = data.readUInt16BE(i + 2);
    const sof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (sof) return [data.readUInt16BE(i + 7), data.readUInt16BE(i + 5)];
    if (len <= 0) break;
    i += 2 + len;
  }
  return null;
}

function png(data: Buffer): [number, number] | null {
  if (data.length < 24) return null;
  if (data.toString('latin1', 1, 4) !== 'PNG') return null;
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

function webp(data: Buffer): [number, number] | null {
  if (data.length < 30) return null;
  if (data.toString('latin1', 0, 4) !== 'RIFF' || data.toString('latin1', 8, 12) !== 'WEBP') return null;
  const fmt = data.toString('latin1', 12, 16);
  if (fmt === 'VP8 ') {
    // lossy：帧头里是 14 位宽高（低 14 位），高 2 位留给缩放
    return [data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff];
  }
  if (fmt === 'VP8L') {
    const bits = data.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (fmt === 'VP8X') {
    return [
      1 + (data[24] | (data[25] << 8) | (data[26] << 16)),
      1 + (data[27] | (data[28] << 8) | (data[29] << 16)),
    ];
  }
  return null;
}

function gif(data: Buffer): [number, number] | null {
  if (data.length < 10 || data.toString('latin1', 0, 3) !== 'GIF') return null;
  return [data.readUInt16LE(6), data.readUInt16LE(8)];
}

/** 返回 [宽, 高]；读不出来返回 null */
export function imageSize(file: string): [number, number] | null {
  let data: Buffer;
  try {
    data = readFileSync(file);
  } catch {
    return null;
  }
  if (data[0] === 0xff && data[1] === 0xd8) return jpeg(data);
  if (data[0] === 0x89) return png(data);
  if (data[0] === 0x47) return gif(data);
  if (data[0] === 0x52) return webp(data);
  return null;
}

/** 宽高比 w/h；拿不到尺寸时返回 fallback */
export function imageAspect(file: string, fallback = 1.5): number {
  const size = imageSize(file);
  if (!size || !size[1]) return fallback;
  return size[0] / size[1];
}
