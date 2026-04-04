import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PromocodesModule } from './promocodes/promocodes.module';

@Module({
  imports: [PromocodesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
