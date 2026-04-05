import { HttpStatus, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import {
  ActivatePromocodeResponseDto,
  ApiErrorDto,
  PromocodeEntity,
  PromocodeListResponseDto,
} from './openapi/swagger-schemas';
import { ListPromocodesQueryDto } from './promocodes/dto/list-promocodes-query.dto';
import { UpdatePromocodeDto } from './promocodes/dto/update-promocode.dto';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Promocode API')
    .setDescription(
      'Promocode REST API. Base path `/api/v1`. Errors use `{ statusCode, error, message }`.',
    )
    .setVersion('1.0')
    .addTag('promocodes', 'Promocodes and activations')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [
      PromocodeEntity,
      ApiErrorDto,
      ActivatePromocodeResponseDto,
      PromocodeListResponseDto,
      UpdatePromocodeDto,
      ListPromocodesQueryDto,
    ],
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
