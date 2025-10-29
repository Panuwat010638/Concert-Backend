# Concert Backend (NestJS)

ส่วน Backend ของระบบจองตั๋วคอนเสิร์ต พัฒนาด้วย NestJS และ MongoDB

## ความต้องการของระบบ

- Node.js version 18 หรือสูงกว่า
- MongoDB (ใช้ MongoDB Atlas หรือติดตั้งในเครื่อง)

## วิธีติดตั้งและตั้งค่า

### 1. ติดตั้ง Dependencies

```PowerShell
npm install
```

### 2. สร้างไฟล์ .env

สร้างไฟล์ `.env` ในโฟลเดอร์ concert-backend แล้วใส่ค่าดังนี้:

```env
MONGODB_URI=mongodb+srv://panuwatkrit001:VCNc7HUBG5rC299y@datawow.yp2cwsc.mongodb.net/concert-db?retryWrites=true&w=majority&appName=datawow
PORT=3001
NODE_ENV=development
```

**หมายเหตุ:** 
- ค่า MONGODB_URI ด้านบนเป็นฐานข้อมูลทดสอบที่เตรียมไว้ให้
- หากต้องการใช้ MongoDB ของตัวเอง ให้เปลี่ยน MONGODB_URI เป็นของคุณเอง

### 3. รันโปรเจค

#### Development Mode (แนะนำ)

```PowerShell
npm run start:dev
```

#### Production Mode

```PowerShell
npm run build
npm run start:prod
```

## สถาปัตยกรรมของระบบ (Architecture)

### โครงสร้างโฟลเดอร์

```
src/
├── concerts/                    # Module จัดการคอนเสิร์ต
│   ├── dto/                    # Data Transfer Objects
│   ├── schemas/                # MongoDB Schemas
│   ├── concerts.controller.ts  
│   ├── concerts.service.ts     
│   └── concerts.module.ts      
├── reservations/                # Module จัดการการจอง
│   ├── dto/                    
│   ├── schemas/                
│   ├── reservations.controller.ts
│   ├── reservations.service.ts 
│   └── reservations.module.ts  
├── action-logs/                 # Module บันทึกประวัติ
│   ├── dto/                    
│   ├── schemas/                
│   ├── action-logs.controller.ts
│   ├── action-logs.service.ts  
│   └── action-logs.module.ts   
├── app.module.ts                # Module หลัก
└── main.ts                      # จุดเริ่มต้นของแอพ
```

### การออกแบบระบบ

- ใช้ **Module Pattern** ของ NestJS แบ่งฟีเจอร์เป็น Module ย่อย
- แต่ละ Module มี Controller, Service และ Schema ของตัวเอง
- ใช้ **Dependency Injection** ในการจัดการ dependencies
- ใช้ **MongoDB** เก็บข้อมูลแบบ NoSQL

## Libraries ที่ใช้

### Dependencies หลัก

- **@nestjs/common** - Core ของ NestJS framework
- **@nestjs/core** - Core modules ของ NestJS
- **@nestjs/config** - จัดการ Environment Variables
- **@nestjs/mongoose** - เชื่อมต่อ MongoDB
- **mongoose** - ODM สำหรับ MongoDB
- **class-validator** - ตรวจสอบความถูกต้องของข้อมูล
- **class-transformer** - แปลงข้อมูล
- **rxjs** - Reactive Programming

### DevDependencies

- **@nestjs/testing** - Tools สำหรับเขียน Unit Tests
- **jest** - Testing Framework
- **typescript** - TypeScript compiler
- **eslint** - ตรวจสอบ Code Quality
- **prettier** - จัด Format Code

## API Endpoints

### Concerts (คอนเสิร์ต)

- `GET /api/concerts` - ดูคอนเสิร์ตทั้งหมด
- `POST /api/concerts` - สร้างคอนเสิร์ตใหม่ (Admin)
- `GET /api/concerts/:id` - ดูรายละเอียดคอนเสิร์ต
- `DELETE /api/concerts/:id` - ลบคอนเสิร์ต (Admin)

### Reservations (การจอง)

- `GET /api/reservations` - ดูการจองทั้งหมด (Admin)
- `POST /api/reservations` - จองตั๋ว
- `GET /api/reservations/user/:username` - ดูการจองของ User
- `GET /api/reservations/concert/:concertId` - ดูการจองของคอนเสิร์ต
- `PATCH /api/reservations/:id/cancel` - ยกเลิกการจอง

### Action Logs (ประวัติ)

- `GET /api/action-logs` - ดูประวัติทั้งหมด (Admin)
- `GET /api/action-logs/user/:username` - ดูประวัติของ User
- `GET /api/action-logs/concert/:concertId` - ดูประวัติของคอนเสิร์ต

## การรัน Tests

```PowerShell
# รัน Unit Tests
npm run test

# รัน Tests แบบ Watch Mode
npm run test:watch

# ดู Test Coverage
npm run test:cov
```

## การแก้ปัญหาเบื้องต้น

### ปัญหา: Port 3001 ถูกใช้งานแล้ว

วิธีแก้: เปลี่ยน PORT ในไฟล์ .env หรือปิด process ที่ใช้ port 3001

### ปัญหา: ไม่สามารถเชื่อมต่อ MongoDB

วิธีแก้: 
1. ตรวจสอบ MONGODB_URI ว่าถูกต้อง
2. ตรวจสอบการเชื่อมต่อ Internet
3. ตรวจสอบ IP Whitelist ใน MongoDB Atlas

## หมายเหตุ

- Backend จะรันที่ http://localhost:3001
- มี CORS configured สำหรับ Frontend ที่ port 3000
- ใช้ Validation Pipe สำหรับตรวจสอบข้อมูลอัตโนมัติ
