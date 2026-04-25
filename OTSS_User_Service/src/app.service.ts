import { Injectable } from '@nestjs/common';
// Test Commit
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
