import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('API проекта Big Ass')
    .setDescription('Rest API проект по говну')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}
