// On-the-fly machine translation via the free MyMemory API.
// Used by the product editor (native → English) and the public product page
// (English → consumer's chosen language).

const MAX = 480; // MyMemory free limit is ~500 chars per request

// Adding a contact email raises the free MyMemory quota from ~1,000 to
// ~50,000 words/day at no cost (no key, no payment required).
const CONTACT_EMAIL = "support@identificationid.com";

async function translateChunk(chunk: string, fromLang: string, toLang: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    chunk
  )}&langpair=${fromLang}|${toLang}&de=${encodeURIComponent(CONTACT_EMAIL)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.responseData?.translatedText) {
    throw new Error(`No translation returned (status ${data.responseStatus})`);
  }
  return data.responseData.translatedText as string;
}

/**
 * Translate text from `fromLang` to `toLang`. Long text is split into
 * sentence-aligned chunks under the MyMemory character limit.
 */
export async function translateText(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  if (!text.trim() || fromLang === toLang) return text;

  if (text.length <= MAX) {
    return translateChunk(text, fromLang, toLang);
  }

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > MAX) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const translated = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, fromLang, toLang))
  );
  return translated.join(" ");
}
