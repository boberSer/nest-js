import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Статус прочтения сообщения',
  })
  @IsBoolean({ message: 'isRead должен быть булевым значением (true/false)' })
  @IsOptional()
  isRead?: boolean;
}
