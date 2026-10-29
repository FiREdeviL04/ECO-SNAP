import { z } from "zod";
export const reportSchema=z.object({title:z.string().min(4).max(100),description:z.string().min(10).max(600),category:z.enum(["Overflowing bin","Litter","Plastic waste","Recycling issue","Illegal dumping","Other"]),location:z.string().min(2).max(100),severity:z.enum(["Low","Medium","High"]),imageUrl:z.string().url(),cloudinaryPublicId:z.string().min(1)});
export type Report=z.infer<typeof reportSchema>&{id:string;status:"Open"|"In Progress"|"Resolved";createdAt:string};
export function cloudinaryImage(url:string,width=700){return url.replace("/upload/",`/upload/f_auto,q_auto,w_${width},c_limit/`);}
