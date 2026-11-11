-- Add the apartment type and update the existing Risa Land listing in place.
-- Keep its price, images, map location, slug, and publication state unchanged.
begin;

alter table public.properties drop constraint if exists properties_property_type_check;
alter table public.properties add constraint properties_property_type_check
  check (property_type in (
    'บ้านเดี่ยว', 'บ้านแฝด', 'ทาวน์เฮาส์ / ทาวน์โฮม',
    'คอนโดมิเนียม', 'อพาร์ตเมนต์', 'ที่ดิน',
    'อาคารพาณิชย์', 'อสังหาริมทรัพย์อื่น ๆ'
  ));

update public.properties
set
  title = 'ขายอพาร์ตเมนต์ริษาแลนด์ (ตึกช้าง) 6 ชั้น ใกล้มหาวิทยาลัยนเรศวร',
  description = $description$ขายอพาร์ตเมนต์ริษาแลนด์ (ตึกช้าง) ในโครงการหอพักท่าโพธิ์ พิษณุโลก ตั้งอยู่ตำบลท่าโพธิ์ อำเภอเมืองพิษณุโลก จังหวัดพิษณุโลก ใกล้มหาวิทยาลัยนเรศวร อาคารสูง 6 ชั้น มีห้องพัก 90 ห้อง บนที่ดินขนาด 2 งาน 99.9 ตารางวา หน้ากว้าง 45 เมตร ลึก 27 เมตร หันหน้าทิศตะวันออก จอดรถได้ 20 คัน ราคาเสนอขาย 44,000,000 บาท

สถานที่ใกล้เคียง
• มหาวิทยาลัยนเรศวร (ประตู 5)
• 7-Eleven
• โลตัส สาขามหาวิทยาลัยนเรศวร
• ร้าน DIY
• ฟินลี่แลนด์ พลาซ่า พิษณุโลก
• หอพักจินดามณี
• ตลาดกลางคืน Night Market

รายการที่รวมพร้อมอาคาร
• เครื่องปรับอากาศ
• เตียงนอน
• ตู้เสื้อผ้าทุกห้อง
• โต๊ะเครื่องแป้ง
• ตู้เย็น
• เครื่องทำน้ำอุ่นทุกห้อง และอีก 1 เครื่อง
• เครื่องซักผ้า 4 เครื่อง
• ระบบสัญญาณเตือนไฟไหม้$description$,
  property_type = 'อพาร์ตเมนต์',
  land_area_sqm = 1199.60,
  parking = 20
where id = 'a9a572e2-513e-4ef3-b788-83a1135ca8e7'
  and slug = 'building-near-naresuan-university-phitsanulok';

commit;
