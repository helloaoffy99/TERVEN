import type { PropertySubmission, PropertyType } from "../data/properties";

export type SubmissionDraft = {
  contactName: string; phone: string; lineId: string; propertyType: PropertyType | "";
  province: string; district: string; subdistrict: string; areaValue: string;
  areaUnit: "sqm" | "sqwa" | "ngan" | "rai"; askingPrice: string;
  description: string; consent: boolean;
};
export type SubmissionErrors = Partial<Record<keyof SubmissionDraft, string>>;
export const emptySubmission: SubmissionDraft = { contactName:"", phone:"", lineId:"", propertyType:"", province:"", district:"", subdistrict:"", areaValue:"", areaUnit:"sqwa", askingPrice:"", description:"", consent:false };

export function validateSubmission(draft: SubmissionDraft): SubmissionErrors {
  const errors: SubmissionErrors = {};
  const phone = draft.phone.replace(/[\s-]/g, "");
  if (draft.contactName.trim().length < 2) errors.contactName = "กรุณาระบุชื่อและนามสกุล";
  if (!/^0\d{8,9}$/.test(phone)) errors.phone = "กรุณาระบุเบอร์โทรศัพท์ไทย 9–10 หลัก";
  if (!draft.propertyType) errors.propertyType = "กรุณาเลือกประเภททรัพย์";
  if (!draft.province) errors.province = "กรุณาเลือกจังหวัด";
  if (!draft.district) errors.district = "กรุณาเลือกอำเภอหรือเขต";
  if (!draft.areaValue || !Number.isFinite(Number(draft.areaValue)) || Number(draft.areaValue) <= 0) errors.areaValue = "กรุณาระบุขนาดพื้นที่มากกว่า 0";
  if (!draft.askingPrice || !Number.isFinite(Number(draft.askingPrice)) || Number(draft.askingPrice) <= 0) errors.askingPrice = "กรุณาระบุราคาที่ต้องการขายมากกว่า 0";
  if (!draft.consent) errors.consent = "กรุณาให้ความยินยอมก่อนตรวจสอบข้อมูล";
  return errors;
}

export function toSubmission(draft: SubmissionDraft): PropertySubmission {
  const factor = { sqm: 1, sqwa: 4, ngan: 400, rai: 1600 }[draft.areaUnit];
  return {
    contactName: draft.contactName.trim(), phone: draft.phone.replace(/[\s-]/g, ""),
    lineId: draft.lineId.trim() || undefined, propertyType: draft.propertyType as PropertyType,
    province: draft.province, district: draft.district, subdistrict: draft.subdistrict.trim() || undefined,
    askingPrice: Number(draft.askingPrice), landAreaSqm: Number(draft.areaValue) * factor,
    description: draft.description.trim() || undefined, consent: draft.consent,
  };
}
