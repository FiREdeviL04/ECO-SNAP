import { z } from "zod";

export const categories = ["Overflowing bin", "Litter", "Plastic waste", "Recycling issue", "Illegal dumping", "Other"] as const;
export const severities = ["Low", "Medium", "High"] as const;
export const statuses = ["Open", "In Progress", "Resolved"] as const;

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

export const reportSchema = z.object({
  title: trimmed(4, 100),
  description: trimmed(10, 600),
  category: z.enum(categories),
  location: trimmed(2, 100),
  severity: z.enum(severities),
  imageUrl: z.string().refine((value) => value.startsWith("https://") || value.startsWith("data:image/"), "Image must use HTTPS or explicit demo data"),
  cloudinaryPublicId: trimmed(1, 255),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type Report = ReportInput & { id: string; status: (typeof statuses)[number]; createdAt: string };

export function cloudinaryImage(url: string, width = 700) {
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

export function isCloudinaryAsset(url: string, publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "ecosnap/reports";
  try {
    const parsed = new URL(url);
    const expectedPrefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    return Boolean(cloudName && parsed.href.startsWith(expectedPrefix) && publicId.startsWith(`${folder}/`));
  } catch {
    return false;
  }
}
