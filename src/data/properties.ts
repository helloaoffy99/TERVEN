export const propertyTypes = ["บ้านเดี่ยว", "บ้านแฝด", "ทาวน์เฮาส์ / ทาวน์โฮม", "คอนโดมิเนียม", "ที่ดิน", "อาคารพาณิชย์", "อสังหาริมทรัพย์อื่น ๆ"] as const;
export const propertyStatuses = ["พร้อมขาย", "จองแล้ว", "ขายแล้ว"] as const;
export type PropertyType = (typeof propertyTypes)[number];
export type PropertyStatus = (typeof propertyStatuses)[number];
export type LandArea = { rai: number; ngan: number; squareWa: number };
export type PropertyImage = { id: string; propertyId: string; imageUrl: string; altText: string; sortOrder: number; isCover: boolean };

export type Property = {
  id: string; propertyCode: string; slug: string; title: string; description: string;
  propertyType: PropertyType; price: number; province: string; district: string; subdistrict?: string;
  landArea?: LandArea; usableAreaSqm?: number; bedrooms?: number; bathrooms?: number; parking?: number;
  latitude?: number; longitude?: number; googleMapsUrl?: string; status: PropertyStatus;
  isFeatured: boolean; images: PropertyImage[]; highlights: string[]; amenities: string[];
  createdAt: string; updatedAt: string;
  // Display fields retained for the existing homepage UI.
  location: string; type: PropertyType; priceLabel: string; area: string; image: string; badge: string;
};

export type PropertySubmission = {
  id?: string; contactName: string; phone: string; lineId?: string; propertyType: PropertyType;
  province: string; district: string; subdistrict?: string; askingPrice: number;
  landAreaSqm: number; description?: string; consent: boolean;
  status?: "draft" | "submitted" | "reviewing"; createdAt?: string;
};

export function landAreaToSquareMeters(area: LandArea): number { return area.rai * 1600 + area.ngan * 400 + area.squareWa * 4; }
export function formatLandArea(area: LandArea): string {
  return [area.rai > 0 && `${area.rai} ไร่`, area.ngan > 0 && `${area.ngan} งาน`, area.squareWa > 0 && `${area.squareWa} ตร.ว.`].filter(Boolean).join(" ") || "ไม่ระบุ";
}
export function formatPrice(price: number): string { return new Intl.NumberFormat("th-TH").format(price); }

type Seed = Omit<Property, "location" | "type" | "priceLabel" | "area" | "image" | "badge" | "images" | "propertyCode" | "updatedAt"> & { cover: string; gallery?: string[] };
function createSample(seed: Seed, index: number): Property {
  const images = [seed.cover, ...(seed.gallery ?? [])].map((imageUrl, sortOrder) => ({ id: `${seed.id}-image-${sortOrder + 1}`, propertyId: seed.id, imageUrl, altText: `ภาพประกอบตัวอย่าง ${seed.title} ลำดับที่ ${sortOrder + 1}`, sortOrder, isCover: sortOrder === 0 }));
  return { ...seed, propertyCode: `DEMO-${String(index + 1).padStart(4, "0")}`, updatedAt: seed.createdAt, images, location: `${seed.district} ${seed.province}`, type: seed.propertyType, priceLabel: formatPrice(seed.price), area: seed.landArea ? formatLandArea(seed.landArea) : `${seed.usableAreaSqm} ตร.ม.`, image: seed.cover, badge: `ตัวอย่าง · ${seed.status}` };
}

const house = "/images/property-chiangmai.webp";
const villa = "/images/property-phuket.webp";
const condo = "/images/property-bangkok.webp";
const residence = "/images/hero-residence.webp";
const land = "/images/property-land-sample.jpg";
const commercial = "/images/property-commercial-sample.jpg";

// Every entry is fictional. Images are illustrative and do not depict actual listed properties.
const seeds: Seed[] = [
  { id:"sample-phuket-villa", slug:"sample-phuket-villa", title:"วิลล่าสไตล์ทรอปิคัล พร้อมสระว่ายน้ำส่วนตัว", description:"ตัวอย่างบ้านพักอาศัยท่ามกลางบรรยากาศร่มรื่น เน้นพื้นที่พักผ่อนภายในและภายนอก ใช้ประกอบการตรวจสอบดีไซน์เท่านั้น", propertyType:"บ้านเดี่ยว", price:28500000, province:"ภูเก็ต", district:"ถลาง", subdistrict:"เชิงทะเล", landArea:{rai:0,ngan:1,squareWa:28}, usableAreaSqm:290, bedrooms:4, bathrooms:4, parking:2, status:"พร้อมขาย", isFeatured:true, cover:villa, gallery:[residence,house], highlights:["สระว่ายน้ำส่วนตัว","พื้นที่พักผ่อนกลางแจ้ง","แสงธรรมชาติ"], amenities:["สระว่ายน้ำ","สวน","ที่จอดรถ"], createdAt:"2026-10-28T09:00:00+07:00" },
  { id:"sample-chiangmai-house", slug:"sample-chiangmai-house", title:"บ้านร่วมสมัย ท่ามกลางวิวภูเขา", description:"ตัวอย่างบ้านเดี่ยวร่วมสมัยพร้อมพื้นที่สีเขียวและมุมมองภูเขา ใช้เพื่อแสดงรูปแบบหน้ารายละเอียดในต้นแบบเว็บไซต์", propertyType:"บ้านเดี่ยว", price:12900000, province:"เชียงใหม่", district:"หางดง", landArea:{rai:0,ngan:0,squareWa:96}, usableAreaSqm:240, bedrooms:3, bathrooms:3, parking:2, status:"พร้อมขาย", isFeatured:true, cover:house, gallery:[residence,villa], highlights:["วิวพื้นที่สีเขียว","พื้นที่ใช้สอยโปร่ง","แสงธรรมชาติ"], amenities:["สวน","ที่จอดรถ"], createdAt:"2026-10-25T09:00:00+07:00" },
  { id:"sample-bangkok-condo", slug:"sample-bangkok-condo", title:"คอนโดวิวแม่น้ำ ในทำเลใจกลางเมือง", description:"ตัวอย่างห้องพักอาศัยในอาคารสูงพร้อมมุมมองเมืองและแม่น้ำ สำหรับทดสอบการนำเสนอข้อมูลอสังหาริมทรัพย์", propertyType:"คอนโดมิเนียม", price:8600000, province:"กรุงเทพมหานคร", district:"คลองสาน", usableAreaSqm:78, bedrooms:2, bathrooms:2, parking:1, status:"พร้อมขาย", isFeatured:true, cover:condo, gallery:[condo], highlights:["มุมมองเมือง","พื้นที่นั่งเล่นกว้าง","แสงธรรมชาติ"], amenities:["ที่จอดรถ"], createdAt:"2026-10-22T09:00:00+07:00" },
  { id:"sample-bangkok-townhome", slug:"sample-bangkok-townhome", title:"ทาวน์โฮมตัวอย่าง พร้อมพื้นที่ทำงาน", description:"ตัวอย่างทาวน์โฮมสำหรับทดสอบตัวกรองและการเรียงลำดับ", propertyType:"ทาวน์เฮาส์ / ทาวน์โฮม", price:5900000, province:"กรุงเทพมหานคร", district:"บางนา", landArea:{rai:0,ngan:0,squareWa:28}, usableAreaSqm:170, bedrooms:3, bathrooms:3, parking:2, status:"จองแล้ว", isFeatured:false, cover:residence, gallery:[house], highlights:["มุมทำงาน","พื้นที่ยืดหยุ่น"], amenities:["ที่จอดรถ"], createdAt:"2026-10-20T09:00:00+07:00" },
  { id:"sample-nonthaburi-twin", slug:"sample-nonthaburi-twin", title:"บ้านแฝดตัวอย่าง ในย่านพักอาศัย", description:"ตัวอย่างบ้านแฝดเพื่อสาธิตหน้ารายการทรัพย์", propertyType:"บ้านแฝด", price:7200000, province:"นนทบุรี", district:"ปากเกร็ด", landArea:{rai:0,ngan:0,squareWa:42}, usableAreaSqm:190, bedrooms:3, bathrooms:2, parking:2, status:"พร้อมขาย", isFeatured:false, cover:house, gallery:[residence], highlights:["พื้นที่ใช้สอยเป็นสัดส่วน"], amenities:["สวน","ที่จอดรถ"], createdAt:"2026-10-18T09:00:00+07:00" },
  { id:"sample-phuket-land", slug:"sample-phuket-land", title:"ที่ดินตัวอย่างสำหรับพัฒนาพื้นที่", description:"ตัวอย่างที่ดินในระบบค้นหา ไม่มีพิกัดหรือข้อมูลแปลงจริง", propertyType:"ที่ดิน", price:14500000, province:"ภูเก็ต", district:"กะทู้", landArea:{rai:1,ngan:2,squareWa:35}, status:"พร้อมขาย", isFeatured:false, cover:land, highlights:["พื้นที่ขนาดใหญ่"], amenities:[], createdAt:"2026-10-16T09:00:00+07:00" },
  { id:"sample-chiangmai-condo", slug:"sample-chiangmai-condo", title:"คอนโดตัวอย่าง ใกล้พื้นที่ไลฟ์สไตล์", description:"ตัวอย่างคอนโดเพื่อสาธิตผลการค้นหา", propertyType:"คอนโดมิเนียม", price:3900000, province:"เชียงใหม่", district:"เมืองเชียงใหม่", usableAreaSqm:45, bedrooms:1, bathrooms:1, status:"ขายแล้ว", isFeatured:false, cover:condo, gallery:[condo], highlights:["พื้นที่กะทัดรัด"], amenities:[], createdAt:"2026-10-14T09:00:00+07:00" },
  { id:"sample-bangkok-commercial", slug:"sample-bangkok-commercial", title:"อาคารพาณิชย์ตัวอย่าง ในย่านเมือง", description:"ตัวอย่างอาคารพาณิชย์สำหรับทดสอบประเภททรัพย์", propertyType:"อาคารพาณิชย์", price:16800000, province:"กรุงเทพมหานคร", district:"วัฒนา", landArea:{rai:0,ngan:0,squareWa:24}, usableAreaSqm:280, parking:1, status:"พร้อมขาย", isFeatured:false, cover:commercial, highlights:["พื้นที่ใช้งานหลายชั้น"], amenities:["ที่จอดรถ"], createdAt:"2026-10-12T09:00:00+07:00" },
  { id:"sample-nonthaburi-house", slug:"sample-nonthaburi-house", title:"บ้านเดี่ยวตัวอย่าง พร้อมสวนส่วนตัว", description:"ตัวอย่างบ้านเดี่ยวสำหรับทดสอบการแบ่งหน้า", propertyType:"บ้านเดี่ยว", price:11900000, province:"นนทบุรี", district:"บางใหญ่", landArea:{rai:0,ngan:1,squareWa:10}, usableAreaSqm:220, bedrooms:4, bathrooms:3, parking:2, status:"จองแล้ว", isFeatured:false, cover:house, gallery:[villa], highlights:["สวนส่วนตัว"], amenities:["สวน","ที่จอดรถ"], createdAt:"2026-10-10T09:00:00+07:00" },
  { id:"sample-phuket-other", slug:"sample-phuket-other", title:"พื้นที่พักผ่อนตัวอย่างใกล้ธรรมชาติ", description:"ตัวอย่างอสังหาริมทรัพย์ประเภทอื่นเพื่อทดสอบตัวกรอง", propertyType:"อสังหาริมทรัพย์อื่น ๆ", price:21900000, province:"ภูเก็ต", district:"เมืองภูเก็ต", landArea:{rai:0,ngan:2,squareWa:0}, usableAreaSqm:320, status:"พร้อมขาย", isFeatured:false, cover:villa, gallery:[residence], highlights:["พื้นที่พักผ่อน"], amenities:["สวน"], createdAt:"2026-10-08T09:00:00+07:00" },
  { id:"sample-chiangmai-townhome", slug:"sample-chiangmai-townhome", title:"ทาวน์โฮมตัวอย่าง สำหรับครอบครัว", description:"ตัวอย่างทาวน์โฮมสำหรับทดสอบการแบ่งหน้าและตัวกรอง", propertyType:"ทาวน์เฮาส์ / ทาวน์โฮม", price:4900000, province:"เชียงใหม่", district:"สันทราย", landArea:{rai:0,ngan:0,squareWa:32}, usableAreaSqm:150, bedrooms:3, bathrooms:2, parking:1, status:"พร้อมขาย", isFeatured:false, cover:house, gallery:[residence], highlights:["พื้นที่ใช้สอยครบ"], amenities:["ที่จอดรถ"], createdAt:"2026-10-06T09:00:00+07:00" },
  { id:"sample-nonthaburi-condo", slug:"sample-nonthaburi-condo", title:"คอนโดตัวอย่าง ในทำเลเดินทางสะดวก", description:"ตัวอย่างคอนโดเพื่อสาธิตระบบค้นหา", propertyType:"คอนโดมิเนียม", price:3100000, province:"นนทบุรี", district:"เมืองนนทบุรี", usableAreaSqm:38, bedrooms:1, bathrooms:1, status:"พร้อมขาย", isFeatured:false, cover:condo, gallery:[condo], highlights:["พื้นที่กะทัดรัด"], amenities:[], createdAt:"2026-10-04T09:00:00+07:00" },
];

export const sampleProperties: Property[] = seeds.map(createSample);
