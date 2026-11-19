const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');

const { isAcceptedImage, compressImageBuffer } = require('../../src/utils/upload');

const file = (name, mimetype) => ({ originalname: name, mimetype });

describe('upload accepts every common photo format', () => {
  it('accepts JPEG/JFIF and their alias MIME types', () => {
    for (const mime of ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/jfif']) {
      assert.equal(isAcceptedImage(file('meal.jfif', mime)), true, mime);
    }
  });

  it('accepts PNG/WebP/GIF/AVIF/HEIC/TIFF/BMP/SVG', () => {
    for (const name of ['a.png', 'a.webp', 'a.gif', 'a.avif', 'a.heic', 'a.heif', 'a.tiff', 'a.bmp', 'a.svg']) {
      assert.equal(isAcceptedImage(file(name, 'image/*')), false, `${name} with wildcard`);
      assert.equal(isAcceptedImage(file(name, '')), true, `${name} with empty MIME`);
    }
  });

  it('trusts the extension when the browser sends no/generic MIME', () => {
    assert.equal(isAcceptedImage(file('IMG_1234.JFIF', '')), true);
    assert.equal(isAcceptedImage(file('IMG_1234.JFIF', 'application/octet-stream')), true);
    assert.equal(isAcceptedImage(file('IMG_1234.HEIC', 'binary/octet-stream')), true);
  });

  it('rejects non-images even when the MIME is missing', () => {
    assert.equal(isAcceptedImage(file('malware.exe', '')), false);
    assert.equal(isAcceptedImage(file('notes.txt', 'text/plain')), false);
    assert.equal(isAcceptedImage(file('doc.pdf', 'application/pdf')), false);
    assert.equal(isAcceptedImage(null), false);
  });

  it('normalizes JPG/PNG/WebP/JFIF/GIF/TIFF/AVIF bytes to JPEG', async () => {
    const source = await sharp({
      create: { width: 48, height: 48, channels: 3, background: { r: 200, g: 120, b: 60 } },
    }).jpeg().toBuffer();

    for (const fmt of ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif']) {
      const input = await sharp(source).toFormat(fmt).toBuffer();
      const out = await compressImageBuffer(input);
      const meta = await sharp(out).metadata();
      assert.equal(meta.format, 'jpeg', `${fmt} -> jpeg`);
      assert.ok(out.length > 0);
    }

    // .jfif is a JPEG payload with a different extension.
    const jfif = await compressImageBuffer(source);
    assert.equal((await sharp(jfif).metadata()).format, 'jpeg');
  });
});
