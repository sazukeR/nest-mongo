import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2') // con esto podemos cambiar la ruta por defecto en todo nuestro crud... ya no seria http://localhost:3000/pokemon sino: http://localhost:3000/api/v2/pokemon

  // para tener las validaciones de class validator de forma global
  app.useGlobalPipes(
    new ValidationPipe({ 
  whitelist: true,
  forbidNonWhitelisted: true, 
    })
  )

  await app.listen(3000);
}
bootstrap();
