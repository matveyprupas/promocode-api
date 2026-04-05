import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PromocodesModule } from './promocodes/promocodes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PromocodesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
