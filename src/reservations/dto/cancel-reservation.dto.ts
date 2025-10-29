import { IsMongoId, IsNotEmpty } from 'class-validator';

// DTO สำหรับยกเลิกการจอง
export class CancelReservationDto {
  @IsMongoId() // ต้องเป็น MongoDB ObjectId
  @IsNotEmpty() // ห้ามว่าง
  reservationId: string; // ID ของการจองที่จะยกเลิก
}
