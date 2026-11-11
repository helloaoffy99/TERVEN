import { formatPrice, type Property, type PropertyImage } from "@/data/properties";

const slug = "land-si-surat-damnoen-saduak-ratchaburi";
const title = "ขายที่ดิน 9 ไร่ 1 งาน 60.6 ตร.ว. ด้านหน้าติดถนนหลัก ด้านหลังติดแม่น้ำ อยู่ติดแลนด์มาร์ค ทำเลดีมาก ดำเนินสะดวก ราชบุรี";
const landArea = { rai: 9, ngan: 1, squareWa: 60.6 };
const pricePerRai = 4_000_000;
const calculatedTotalPrice = Math.round(pricePerRai * (landArea.rai + landArea.ngan / 4 + landArea.squareWa / 400));

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

const housePhotos: Array<{ file: string; alt: string }> = [
  { file: "01-exterior.jpg", alt: "บ้านเดี่ยวสไตล์โมเดิร์นด้านหน้าและที่จอดรถ" },
  { file: "02-living-room.jpg", alt: "ห้องรับแขกและห้องนั่งเล่น" },
  { file: "03-bedroom-two.jpg", alt: "ห้องนอนที่ 2 มุมที่หนึ่ง" },
  { file: "04-bedroom-two-alt.jpg", alt: "ห้องนอนที่ 2 มุมที่สอง" },
  { file: "05-living-room-alt.jpg", alt: "ห้องรับแขกอีกมุมหนึ่ง" },
  { file: "06-bedroom-one.jpg", alt: "ห้องนอนที่ 1 มุมที่หนึ่ง" },
  { file: "07-bedroom-one-alt.jpg", alt: "ห้องนอนที่ 1 มุมที่สอง" },
  { file: "08-upstairs-bathroom.jpg", alt: "ห้องน้ำชั้นบน" },
  { file: "09-downstairs-bathroom.jpg", alt: "ห้องน้ำชั้นล่าง" },
  { file: "10-hallway.jpg", alt: "ทางเดินและบันไดภายในบ้าน" },
  { file: "11-carport.jpg", alt: "พื้นที่จอดรถใต้ตัวบ้าน" },
  { file: "12-kitchen.jpg", alt: "ห้องครัวและประตูหลังบ้าน" },
];

const houseImages: PropertyImage[] = housePhotos.map(({ file, alt }, index) => ({
  id: `lak-ha-house-image-${index + 1}`,
  propertyId: "curated-lak-ha-house",
  imageUrl: `/images/modern-house-lak-ha/${file}`,
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
    `ที่ดินเปล่า 2 แปลงติดกัน ในตำบลศรีสุราษฎร์ อำเภอดำเนินสะดวก จังหวัดราชบุรี เนื้อที่รวม 9 ไร่ 1 งาน 60.6 ตารางวา ราคาไร่ละ ${formatPrice(pricePerRai)} บาท`,
    "แปลงที่ 1: 4 ไร่ 3 งาน 20.6 ตารางวา\nแปลงที่ 2: 4 ไร่ 2 งาน 40 ตารางวา",
    "ใกล้สิ่งอำนวยความสะดวกและจุดแลนด์มาร์ค\n• อยู่ติดคาเฟ่เครื่องบิน Damnoen Sky\n• อยู่ติดสวนอาหารขวัญดำเนิน\n• อยู่ในชุมชน ใกล้ 7-Eleven\n• ใกล้แหล่งท่องเที่ยว โรงเรียน หน่วยงานราชการ วัด และโรงเจ",
    "จุดเด่นของทำเล\n• ด้านหน้าติดถนนใหญ่ ด้านหลังติดแม่น้ำ\n• น้ำ-ไฟ สาธารณะพร้อม\n• เดินทางสะดวก",
    "แบ่งขายได้ หากสนใจแบ่งซื้อ กรุณาสอบถามราคาและเงื่อนไขทาง LINE",
    "ภาพถ่ายแสดงสภาพพื้นที่ แนวน้ำ และถนนบริเวณใกล้เคียง",
    "ภาพแผนผังใช้ประกอบการดูตำแหน่งโดยประมาณ ประกาศนี้เสนอขายเฉพาะแปลงที่ 1 และ 2 ไม่รวมพื้นที่หรือกิจการ Damnoen Sky ที่แสดงเป็นจุดอ้างอิง",
  ].join("\n\n"),
  propertyType: "ที่ดิน",
  // Search and sorting use the calculated total; the public listing quotes the per-rai rate.
  price: calculatedTotalPrice,
  province: "ราชบุรี",
  district: "ดำเนินสะดวก",
  subdistrict: "ศรีสุราษฎร์",
  landArea,
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
  priceLabel: `${formatPrice(pricePerRai)} / ไร่`,
  area: "9 ไร่ 1 งาน 60.6 ตร.ว.",
  image: images[0].imageUrl,
  badge: "พร้อมขาย",
}, {
  id: "curated-lak-ha-house",
  propertyCode: "TV-RB-002",
  slug: "modern-detached-house-lak-ha-damnoen-saduak-ratchaburi",
  title: "ขายบ้านเดี่ยวสไตล์โมเดิร์น หลักห้า–ดำเนินสะดวก ราชบุรี เหลือ 2 หลังสุดท้าย",
  description: [
    "บ้านเดี่ยวสไตล์โมเดิร์น บนทำเลถนนหลักห้า–ดำเนินสะดวก จังหวัดราชบุรี ราคา 4,200,000 บาทต่อหลัง เหลือ 2 หลังสุดท้าย",
    "พื้นที่ใช้สอย 118.50 ตารางเมตร ฟังก์ชัน 2 ห้องนอน 2 ห้องน้ำ 1 ห้องครัว 1 ห้องรับแขก และที่จอดรถ 2 คัน",
    "ภายในมีพื้นที่นั่งเล่น ห้องครัว และห้องนอน 2 ห้อง พร้อมห้องน้ำทั้งชั้นบนและชั้นล่าง ใกล้แหล่งชุมชนและสิ่งอำนวยความสะดวกในย่านหลักห้า",
    "สนใจสอบถามรายละเอียดของบ้านที่ยังว่าง หรือนัดชมสถานที่ ติดต่อ TERVÉN ทาง LINE",
  ].join("\n\n"),
  propertyType: "บ้านเดี่ยว",
  price: 4_200_000,
  province: "ราชบุรี",
  district: "ดำเนินสะดวก",
  usableAreaSqm: 118.5,
  bedrooms: 2,
  bathrooms: 2,
  parking: 2,
  googleMapsUrl: "https://maps.app.goo.gl/t8NhkLM5Qyzpvy9o7",
  status: "พร้อมขาย",
  isFeatured: true,
  images: houseImages,
  highlights: ["เหลือ 2 หลังสุดท้าย", "พื้นที่ใช้สอย 118.50 ตร.ม.", "2 ห้องนอน 2 ห้องน้ำ", "จอดรถได้ 2 คัน"],
  amenities: ["ห้องครัว", "ห้องรับแขก", "ที่จอดรถ"],
  createdAt: "2026-11-11T22:51:00+07:00",
  updatedAt: "2026-11-11T22:51:00+07:00",
  location: "ดำเนินสะดวก ราชบุรี",
  type: "บ้านเดี่ยว",
  priceLabel: formatPrice(4_200_000),
  area: "118.50 ตร.ม.",
  image: houseImages[0].imageUrl,
  badge: "เหลือ 2 หลัง",
}];
