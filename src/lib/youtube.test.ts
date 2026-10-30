/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unit Test Logika Inti YouTube Helper
 * Menguji ekstraksi ID YouTube, format durasi, ekstraksi info channel, dan kalkulasi progress.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  formatDuration,
  parseDurationToSeconds,
  calculateProgressPercentage,
  extractYouTubeChannelInfo,
  fetchYouTubeChannelMetadata,
} from './youtube';

test('ekstraksi ID YouTube dari berbagai format URL', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('invalid-url-string'), null);
});

test('generate URL thumbnail YouTube', () => {
  assert.equal(getYouTubeThumbnail('dQw4w9WgXcQ', 'hq'), 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
});

test('format durasi detik ke string waktu', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3665), '1:01:05');
});

test('parse string durasi ke detik', () => {
  assert.equal(parseDurationToSeconds('01:05'), 65);
  assert.equal(parseDurationToSeconds('1:01:05'), 3665);
});

test('kalkulasi persentase progress video', () => {
  assert.equal(calculateProgressPercentage(50, 100), 50);
  assert.equal(calculateProgressPercentage(100, 100), 100);
  assert.equal(calculateProgressPercentage(0, 100), 0);
  assert.equal(calculateProgressPercentage(120, 100), 100);
});

test('ekstraksi info saluran YouTube dari berbagai format', () => {
  // Format handle @
  const handleInfo = extractYouTubeChannelInfo('https://www.youtube.com/@mkbhd');
  assert.equal(handleInfo?.type, 'handle');
  assert.equal(handleInfo?.identifier, 'mkbhd');

  // Format custom /c/
  const customInfo = extractYouTubeChannelInfo('https://www.youtube.com/c/LinusTechTips');
  assert.equal(customInfo?.type, 'custom');
  assert.equal(customInfo?.identifier, 'LinusTechTips');

  // Format channel ID /channel/UC...
  const idInfo = extractYouTubeChannelInfo('https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw');
  assert.equal(idInfo?.type, 'channelId');
  assert.equal(idInfo?.identifier, 'UCXuqSBlHAE6Xw-yeJA0Tunw');

  // Format @ langsung
  const directHandle = extractYouTubeChannelInfo('@Fireship');
  assert.equal(directHandle?.type, 'handle');
  assert.equal(directHandle?.identifier, 'Fireship');
});

test('fetchYouTubeChannelMetadata mengurai nama dan avatar', async () => {
  const result = await fetchYouTubeChannelMetadata('https://www.youtube.com/@mkbhd');
  assert.ok(result);
  assert.equal(result.name, 'mkbhd');
  assert.ok(result.avatarUrl.includes('unavatar.io'));
});
