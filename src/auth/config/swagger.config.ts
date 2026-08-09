import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('API проекта Берёзовые соски by Елизавета')
    .setDescription('Rest API проект')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}
