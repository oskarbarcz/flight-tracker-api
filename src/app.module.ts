import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AircraftModule } from './aircraft/aircraft.module';

@Module({
  imports: [AircraftModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
