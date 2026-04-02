import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const firstNames = [
  "สมชาย",
  "สมหญิง",
  "ศิริพร",
  "อนันต์",
  "กิตติ",
  "อรทัย",
  "ปวีณา",
  "ชัยวัฒน์",
  "ธนพร",
  "นฤมล",
  "วีระ",
  "ชนกพร",
];

const lastNames = [
  "ใจดี",
  "บุญมาก",
  "แสงทอง",
  "สุวรรณ",
  "เพชรดี",
  "รุ่งเรือง",
  "อินทร์แก้ว",
  "พูนสุข",
  "มณีวงศ์",
  "ศรีสวัสดิ์",
];

const locations = [
  "ชุมชนตลาดเก่า เขต 1",
  "หมู่ 4 ตำบลหนองกลาง",
  "หน้าวัดประชาราษฎร์",
  "ซอยสุขใจ 7",
  "ถนนเลียบคลองฝั่งตะวันออก",
  "ชุมชนริมทางรถไฟ",
  "หน้าโรงเรียนบ้านคลองใหม่",
  "หมู่บ้านเอื้ออาทร บล็อก C",
  "สามแยกไฟแดงกลางตลาด",
  "ริมคลองหลังสถานีอนามัย",
];

const issueTemplates = [
  "ไฟส่องสว่างดับต่อเนื่องหลายวัน ทำให้ช่วงกลางคืนมืดมากและประชาชนไม่ปลอดภัย",
  "ถนนชำรุดเป็นหลุมลึก รถจักรยานยนต์ล้มบ่อย อยากให้เร่งซ่อมแซม",
  "ท่อระบายน้ำอุดตัน ส่งผลให้น้ำท่วมขังทุกครั้งที่ฝนตกหนัก",
  "ขยะสะสมบริเวณจุดทิ้งรวม ทำให้เกิดกลิ่นรบกวนและแมลงวันจำนวนมาก",
  "มีสุนัขจรจัดรวมกลุ่มหน้าโรงเรียน ผู้ปกครองกังวลเรื่องความปลอดภัยของเด็ก",
  "เสาไฟเอนตัวและสายไฟหย่อนต่ำ ควรมีเจ้าหน้าที่เข้ามาตรวจสอบโดยด่วน",
  "น้ำประปาไหลอ่อนในช่วงเช้าและเย็น ทำให้ชาวบ้านใช้น้ำไม่เพียงพอ",
  "ทางเท้าหน้าตลาดแตกเสียหาย ผู้สูงอายุเดินลำบากและเสี่ยงหกล้ม",
];

const newsTitles = [
  "ลงพื้นที่ติดตามการแก้ปัญหาน้ำท่วมขังในชุมชนริมคลอง",
  "พบประชาชนรับฟังข้อเสนอเรื่องความปลอดภัยทางถนนในเขตเมือง",
  "ประสานหน่วยงานเร่งซ่อมไฟสาธารณะบริเวณหน้าโรงเรียน",
  "จัดประชุมทีมงานอาสาเพื่อเตรียมแผนช่วยเหลือผู้สูงอายุ",
  "ร่วมกิจกรรมพัฒนาความสะอาดตลาดชุมชนและพื้นที่สาธารณะ",
  "ติดตามความคืบหน้าโครงการปรับปรุงท่อระบายน้ำสายหลัก",
  "เปิดศูนย์รับเรื่องร้องเรียนเคลื่อนที่ให้บริการประชาชนในพื้นที่",
  "หารือผู้ประกอบการท้องถิ่นเพื่อผลักดันเศรษฐกิจชุมชน",
  "มอบอุปกรณ์การเรียนให้โรงเรียนขนาดเล็กในพื้นที่ห่างไกล",
  "ร่วมประชุมกับเทศบาลแก้ปัญหาการจราจรหน้าโรงพยาบาล",
];

const newsBodies = [
  "ทีมงานลงพื้นที่ตรวจสอบสภาพปัญหาจริง ร่วมรับฟังข้อเสนอจากประชาชน และประสานหน่วยงานที่เกี่ยวข้องเพื่อกำหนดแผนแก้ไขอย่างเป็นรูปธรรม โดยยืนยันว่าจะติดตามผลต่อเนื่องจนกว่าปัญหาจะคลี่คลาย",
  "ในการพบปะประชาชนครั้งนี้ มีการสะท้อนปัญหาด้านโครงสร้างพื้นฐาน ความปลอดภัย และคุณภาพชีวิตในชุมชนอย่างหลากหลาย พร้อมทั้งมีข้อเสนอให้เร่งดำเนินการในจุดที่มีความเสี่ยงสูงต่อประชาชน",
  "หลังรับฟังข้อมูลจากชาวบ้านและผู้นำชุมชน ทีมงานได้รวบรวมประเด็นสำคัญ ส่งต่อไปยังหน่วยงานที่รับผิดชอบ และกำหนดกรอบติดตามงานอย่างชัดเจน เพื่อให้การแก้ปัญหาเกิดผลในทางปฏิบัติ",
  "นอกจากการติดตามเรื่องร้องเรียนเฉพาะหน้า ยังได้มีการหารือแนวทางป้องกันปัญหาระยะยาว เพื่อยกระดับคุณภาพชีวิตและสร้างความปลอดภัยให้ประชาชนในพื้นที่อย่างยั่งยืน",
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[rand(0, list.length - 1)];
}

function randomPhone() {
  return `08${rand(1, 9)}${rand(1000000, 9999999)}`;
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function buildReports(count = 24) {
  const statuses = ["new", "in-progress", "done"];

  return Array.from({ length: count }, (_, index) => {
    const status = index < 10 ? "new" : index < 18 ? "in-progress" : "done";
    return {
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      phone: randomPhone(),
      message: pick(issueTemplates),
      location: pick(locations),
      imageUrl: index % 5 === 0 ? "/profile-placeholder.svg" : null,
      status: statuses.includes(status) ? status : "new",
      createdAt: hoursAgo(rand(6, 24 * 25)),
    };
  });
}

function buildNews(count = 10) {
  return Array.from({ length: count }, (_, index) => ({
    title: newsTitles[index % newsTitles.length],
    content: `${pick(newsBodies)}\n\n${pick(newsBodies)}`,
    imageUrl: index % 2 === 0 ? "/profile-placeholder.svg" : null,
    createdAt: hoursAgo(rand(8, 24 * 40)),
  }));
}

async function main() {
  const reports = buildReports();
  const news = buildNews();

  await prisma.report.deleteMany();
  await prisma.news.deleteMany();

  await prisma.news.createMany({ data: news });
  await prisma.report.createMany({ data: reports });

  console.log(`Seeded ${news.length} news items`);
  console.log(`Seeded ${reports.length} reports`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
