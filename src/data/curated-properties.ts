import type { Property, PropertyImage } from "@/data/properties";

const slug = "land-si-surat-damnoen-saduak-ratchaburi";
const title = "ขายที่ดิน 9 ไร่ 1 งาน 60.6 ตร.ว. ด้านหน้าติดถนนหลัก ด้านหลังติดแม่น้ำ อยู่ติดแลนด์มาร์ค ทำเลดีมาก ดำเนินสะดวก ราชบุรี";

const photos: Array<{ file: string; alt: string }> = [
  { file: "overview.webp", alt: "ภาพแผนผังประกอบแสดงแปลงที่ดิน 1 และ 2 ใกล้ Damnoen Sky" },
  { file: "land-view.webp", alt: "สภาพพื้นที่ที่ดินเปล่าในตำบลศรีสุราษฎร์" },
  { file: "canal-view.webp", alt: "มุมมองที่ดินและแนวน้ำบริเวณใกล้เคียง" },
  { file: "canal-access.webp", alt: "มุมมองแนวน้ำและพื้นที่ที่ดิน" },
  { file: "road-view.webp", alt: "ถนนบริเวณทางเข้าที่ดิน" },
];

const images: PropertyImage[] = photos.map(({ file, alt }, index) => ({
  id: `damnoen-land-image-${index + 1}`,
  propertyId: "curated-damnoen-land",
  imageUrl: `/images/damnoen-land/${file}`,
  altText: alt,
  sortOrder: index,
  isCover: index === 0,
}));

export const curatedProperties: Property[] = [{
  id: "curated-damnoen-land",
  propertyCode: "TV-RB-001",
  slug,
  title,
  description: [
    "ที่ดินเปล่า 2 แปลงติดกัน ในตำบลศรีสุราษฎร์ อำเภอดำเนินสะดวก จังหวัดราชบุรี เสนอขายรวมเนื้อที่ 9 ไร่ 1 งาน 60.6 ตารางวา ราคา 40,000,000 บาท",
    "แปลงที่ 1: 4 ไร่ 3 งาน 20.6 ตารางวา\nแปลงที่ 2: 4 ไร่ 2 งาน 40 ตารางวา",
    "ใกล้สิ่งอำนวยความสะดวกและจุดแลนด์มาร์ค\n• อยู่ติดคาเฟ่เครื่องบิน Damnoen Sky\n• อยู่ติดสวนอาหารขวัญดำเนิน\n• อยู่ในชุมชน ใกล้ 7-Eleven\n• ใกล้แหล่งท่องเที่ยว โรงเรียน หน่วยงานราชการ วัด และโรงเจ",
    "จุดเด่นของทำเล\n• ด้านหน้าติดถนนใหญ่ ด้านหลังติดแม่น้ำ\n• น้ำ-ไฟ สาธารณะพร้อม\n• เดินทางสะดวก",
    "แบ่งขายได้ หากสนใจแบ่งซื้อ กรุณาสอบถามราคาและเงื่อนไขทาง LINE",
    "ภาพถ่ายแสดงสภาพพื้นที่ แนวน้ำ และถนนบริเวณใกล้เคียง",
    "ภาพแผนผังใช้ประกอบการดูตำแหน่งโดยประมาณ ประกาศนี้เสนอขายเฉพาะแปลงที่ 1 และ 2 ไม่รวมพื้นที่หรือกิจการ Damnoen Sky ที่แสดงเป็นจุดอ้างอิง",
  ].join("\n\n"),
  propertyType: "ที่ดิน",
  price: 40000000,
  province: "ราชบุรี",
  district: "ดำเนินสะดวก",
  subdistrict: "ศรีสุราษฎร์",
  landArea: { rai: 9, ngan: 1, squareWa: 60.6 },
  latitude: 13.526144,
  longitude: 99.973585,
  googleMapsUrl: "https://maps.app.goo.gl/zTLyrahoziCQq8Zm6",
  status: "พร้อมขาย",
  isFeatured: true,
  images,
  highlights: ["ที่ดิน 2 แปลงติดกัน เนื้อที่รวม 9 ไร่ 1 งาน 60.6 ตร.ว.", "ด้านหน้าติดถนนใหญ่ ด้านหลังติดแม่น้ำ", "น้ำ-ไฟ สาธารณะพร้อม", "แบ่งขายได้ สอบถามเงื่อนไขทาง LINE"],
  amenities: [],
  createdAt: "2026-11-11T00:00:00+07:00",
  updatedAt: "2026-11-11T00:00:00+07:00",
  location: "ดำเนินสะดวก ราชบุรี",
  type: "ที่ดิน",
  priceLabel: "40,000,000",
  area: "9 ไร่ 1 งาน 60.6 ตร.ว.",
  image: images[0].imageUrl,
  badge: "พร้อมขาย",
}];
