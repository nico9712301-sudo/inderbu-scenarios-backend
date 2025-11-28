// infrastructure/adapters/inbound/http/controllers/auth.controller.ts

import { Controller } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Controller('playground')
export class PlaygrounController {
  constructor() {}

  // Using bcryptjs let's create a method to hash a password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    return await bcrypt.hash(password, salt); // Hash the password with the salt
  }
}
