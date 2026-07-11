import type { Message } from "@/types";

export const messages: Message[] = [
  { id: "m1", sender_id: "admin", receiver_id: "par1", content: "Please attend PTM on 20th March without fail.", timestamp: "2026-03-10T09:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Kumar" },
  { id: "m2", sender_id: "par1", receiver_id: "admin", content: "Sure, we will be there. Thank you.", timestamp: "2026-03-10T10:30:00", sender_name: "Mr/Mrs Kumar", receiver_name: "Principal" },
  { id: "m3", sender_id: "admin", receiver_id: "t1", content: "Please submit the mid-term question papers by Friday.", timestamp: "2026-03-09T11:00:00", sender_name: "Principal", receiver_name: "Mrs Sharma" },
  { id: "m4", sender_id: "t1", receiver_id: "admin", content: "Will submit by Thursday evening.", timestamp: "2026-03-09T11:30:00", sender_name: "Mrs Sharma", receiver_name: "Principal" },
  { id: "m5", sender_id: "admin", receiver_id: "par3", content: "Rahul's attendance is below 80%. Please ensure regular attendance.", timestamp: "2026-03-08T08:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Das" },
  { id: "m6", sender_id: "admin", receiver_id: "t4", content: "Please share the lab schedule for next week.", timestamp: "2026-03-07T14:00:00", sender_name: "Principal", receiver_name: "Mr Singh" },
  { id: "m7", sender_id: "t4", receiver_id: "admin", content: "Lab schedule has been shared on the notice board.", timestamp: "2026-03-07T15:00:00", sender_name: "Mr Singh", receiver_name: "Principal" },
  { id: "m8", sender_id: "admin", receiver_id: "par5", content: "Arjun has shown great improvement in Science. Keep it up!", timestamp: "2026-03-06T10:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Mehta" },
  { id: "m9", sender_id: "t1", receiver_id: "stu1", content: "Please submit your math assignment by tomorrow.", timestamp: "2026-03-11T09:00:00", sender_name: "Mrs Sharma", receiver_name: "Student" },
  { id: "m10", sender_id: "stu1", receiver_id: "t1", content: "Yes ma'am, I will submit it today.", timestamp: "2026-03-11T09:30:00", sender_name: "Student", receiver_name: "Mrs Sharma" },
  { id: "m11", sender_id: "t4", receiver_id: "stu1", content: "Great work on the science project! Keep it up.", timestamp: "2026-03-10T14:00:00", sender_name: "Mr Singh", receiver_name: "Student" },
  { id: "m12", sender_id: "stu1", receiver_id: "t4", content: "Thank you sir! I enjoyed working on it.", timestamp: "2026-03-10T14:30:00", sender_name: "Student", receiver_name: "Mr Singh" },
  { id: "m13", sender_id: "admin", receiver_id: "stu1", content: "You have been selected for the science quiz competition.", timestamp: "2026-03-09T11:00:00", sender_name: "School Office", receiver_name: "Student" },
  { id: "m14", sender_id: "stu1", receiver_id: "admin", content: "Thank you! I will prepare well for it.", timestamp: "2026-03-09T11:30:00", sender_name: "Student", receiver_name: "School Office" },
];
