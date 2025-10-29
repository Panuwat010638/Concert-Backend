import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertDto } from './create-concert.dto';

// DTO สำหรับอัพเดทคอนเสิร์ต (ทุก field เป็น optional)
export class UpdateConcertDto extends PartialType(CreateConcertDto) {}
