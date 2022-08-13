import fetch from 'cross-fetch';
import { Torrent } from './types/movies.js';

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const trackers = [
  'http://track.one:1234/announce',
  'udp://tracker.openbittorrent.com:80',
  'udp://track.two:80',
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.coppersurfer.tk:6969',
  'udp://glotorrents.pw:6969/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://torrent.gresille.org:80/announce',
  'udp://p4p.arenabg.com:1337',
  'udp://tracker.leechers-paradise.org:6969',
];

const trackerString = trackers.join('&tr=');

export function generateMagnetLink(
  torrent: Torrent,
  movieName: string,
): string {
  return `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(
    movieName,
  )}&tr=${trackerString}`;
}

export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const data = await response.arrayBuffer();
  const buf = Buffer.from(data);
  return buf;
}
