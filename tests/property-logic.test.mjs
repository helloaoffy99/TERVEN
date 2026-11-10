import test from "node:test";
import assert from "node:assert/strict";
import { sampleProperties, landAreaToSquareMeters, formatLandArea } from "../src/data/properties.ts";
import { defaultFilters, getDistricts, readFilters, searchProperties, writeFilters } from "../src/lib/property-search.ts";
import { emptySubmission, toSubmission, validateSubmission } from "../src/lib/submission.ts";

test("combined search filters restrict province, district, type, status, and price", () => {
  const result = searchProperties(sampleProperties, { ...defaultFilters, province: "ภูเก็ต", district: "ถลาง", type: "บ้านเดี่ยว", status: "พร้อมขาย", minPrice: "20000000", maxPrice: "30000000" });
  assert.equal(result.total, 1);
  assert.equal(result.items[0].slug, "sample-phuket-villa");
  assert.equal(searchProperties(sampleProperties, { ...defaultFilters, q: "DEMO-0003" }).items[0].slug, "sample-bangkok-condo");
});

test("districts depend on province", () => {
  const phuket = getDistricts(sampleProperties, "ภูเก็ต");
  assert.ok(phuket.includes("ถลาง"));
  assert.ok(!phuket.includes("คลองสาน"));
});

test("price/date sorting and pagination are stable", () => {
  const low = searchProperties(sampleProperties, { ...defaultFilters, sort: "price-asc" }, 6);
  const high = searchProperties(sampleProperties, { ...defaultFilters, sort: "price-desc" }, 6);
  const second = searchProperties(sampleProperties, { ...defaultFilters, page: 2 }, 6);
  assert.equal(low.items[0].price, Math.min(...sampleProperties.map((item) => item.price)));
  assert.equal(high.items[0].price, Math.max(...sampleProperties.map((item) => item.price)));
  assert.equal(second.items.length, 6);
  assert.equal(second.totalPages, 2);
  assert.notEqual(second.items[0].id, searchProperties(sampleProperties, defaultFilters, 6).items[0].id);
});

test("filters round-trip through shareable query parameters", () => {
  const filters = { ...defaultFilters, q: "วิวภูเขา", province: "เชียงใหม่", district: "หางดง", minPrice: "1000000", maxPrice: "15000000", sort: "price-desc", page: 2 };
  assert.deepEqual(readFilters(writeFilters(filters)), filters);
});

test("Thai area units convert correctly", () => {
  const area = { rai: 1, ngan: 2, squareWa: 35 };
  assert.equal(landAreaToSquareMeters(area), 2540);
  assert.equal(formatLandArea(area), "1 ไร่ 2 งาน 35 ตร.ว.");
});

test("submission validates required fields and converts land area", () => {
  const bad = validateSubmission(emptySubmission);
  assert.ok(bad.phone && bad.consent && bad.areaValue && bad.askingPrice);
  const valid = { ...emptySubmission, contactName: "ผู้ทดสอบ ระบบ", phone: "0812345678", propertyType: "บ้านเดี่ยว", province: "ภูเก็ต", district: "ถลาง", areaValue: "100", areaUnit: "sqwa", askingPrice: "12000000", consent: true };
  assert.deepEqual(validateSubmission(valid), {});
  assert.equal(toSubmission(valid).landAreaSqm, 400);
});
