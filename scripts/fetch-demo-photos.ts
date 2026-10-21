/**
 * Downloads the licensed demo photography used by the Konzeptdemo surfaces.
 *
 *   pnpm demo:photos
 *
 * Source: Unsplash (free photos only – https://unsplash.com/license: free for
 * commercial use, no attribution required). Credits are still recorded in
 * public/demo/credits.json. Output: public/demo/<name>.webp (+ <name>-sm.webp).
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Crop = { left: number; top: number; width: number; height: number }; // fractions 0..1
type Photo = { name: string; id: string; width?: number; crop?: Crop };

const PHOTOS: Photo[] = [
  // Atmosphere
  { name: "showroom-dark", id: "J8EJtp8Hob4" },
  { name: "headlights-dark", id: "9pW_u2wynx0" },
  { name: "bmw-matte-front", id: "qs4COSSNwY4" },
  { name: "light-lines", id: "VKp2zCaS0BE" },
  { name: "showroom-bright", id: "9njClq6GPG0" },
  { name: "showroom-purple", id: "jobECyr3Fg8" },
  // Demo stock (titles in src/config/demo.ts match the car in each photo)
  { name: "car-bmw-m3", id: "94lAQc7ipNg" },
  { name: "car-bmw-m5", id: "uHJ8sgM36Gs" },
  { name: "car-bmw-m4", id: "1BWBiUUT-AA" },
  { name: "car-audi-q5", id: "Vre1o5JfSjU" },
  { name: "car-mercedes-s", id: "y3neNkE6efI" },
  { name: "car-amg-gt", id: "uUi5RQCyUdM" },
  { name: "car-porsche-gt3", id: "NeH9w4CdmnA" },
  { name: "car-audi-rs7", id: "4gSavS9pe1s" },
  { name: "car-vw-tiguan", id: "szh2p-vijKI" },
  { name: "car-tesla-y", id: "m09N69WTs1o" },
  { name: "car-audi-rs3", id: "_E4bZ0lBE3g" },
  // Seller enquiry (Ankauf) photo sets
  { name: "sell-s3-rear", id: "BW4OQWY1ghY" },
  { name: "sell-s3-wheel", id: "BW4OQWY1ghY", crop: { left: 0.38, top: 0.52, width: 0.3, height: 0.42 } },
  { name: "sell-s3-light", id: "BW4OQWY1ghY", crop: { left: 0.6, top: 0.38, width: 0.32, height: 0.36 } },
  { name: "sell-s3-interior", id: "HUkeaBi9Lqs" },
  { name: "sell-cluster", id: "mJPheg3MyOk" },
  { name: "sell-m5-front", id: "Hjl6WPNNI_c" },
  { name: "sell-m5-grille", id: "Hjl6WPNNI_c", crop: { left: 0.3, top: 0.45, width: 0.4, height: 0.35 } },
  { name: "sell-interior", id: "2gybIHnDHd8" },
];

const OUT = path.join(process.cwd(), "public", "demo");

function photographer(dl: string | null, id: string) {
  if (!dl) return "Unsplash";
  const slug = dl.replace(`-${id}-unsplash.jpg`, "");
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const cache = new Map<string, { buffer: Buffer; dl: string | null }>();
  const credits: Record<string, { photographer: string; source: string; unsplashId: string; license: string }> = {};

  for (const photo of PHOTOS) {
    if (!cache.has(photo.id)) {
      const res = await fetch(`https://unsplash.com/photos/${photo.id}/download?force=true`, { redirect: "manual" });
      const location = res.headers.get("location");
      if (!location) throw new Error(`No download redirect for ${photo.id} (status ${res.status})`);
      const url = new URL(location);
      if (!url.hostname.startsWith("images.unsplash.com")) throw new Error(`${photo.id} is not a free Unsplash photo`);
      const dl = url.searchParams.get("dl");
      url.searchParams.delete("dl");
      url.searchParams.set("w", "2400");
      url.searchParams.set("q", "85");
      url.searchParams.set("fm", "jpg");
      const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
      cache.set(photo.id, { buffer, dl });
    }
    const { buffer, dl } = cache.get(photo.id)!;
    let pipeline = sharp(buffer).rotate();
    if (photo.crop) {
      const meta = await sharp(buffer).metadata();
      const W = meta.width!;
      const H = meta.height!;
      pipeline = pipeline.extract({
        left: Math.round(photo.crop.left * W),
        top: Math.round(photo.crop.top * H),
        width: Math.round(photo.crop.width * W),
        height: Math.round(photo.crop.height * H),
      });
    }
    const base = await pipeline.toBuffer();
    await sharp(base).resize({ width: photo.width ?? 1800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, `${photo.name}.webp`));
    await sharp(base).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(OUT, `${photo.name}-sm.webp`));
    credits[photo.name] = {
      photographer: photographer(dl, photo.id),
      source: `https://unsplash.com/photos/${photo.id}`,
      unsplashId: photo.id,
      license: "Unsplash License – https://unsplash.com/license",
    };
    console.log(`✓ ${photo.name} ← ${photo.id} (${credits[photo.name].photographer})`);
  }

  await writeFile(path.join(OUT, "credits.json"), JSON.stringify(credits, null, 2) + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
