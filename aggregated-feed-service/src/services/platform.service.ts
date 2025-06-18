import { IPlatformDal } from '../dal/platform-dal.js';
import { PlatformDTO } from '../dto/PlatformDTO.js';

export class PlatformService {
  private platformDal: IPlatformDal;

  constructor(platformDal: IPlatformDal) {
    this.platformDal = platformDal;
  }

  async getPlatforms(): Promise<PlatformDTO[]> {
    return await this.platformDal.getPlatforms();
  }
} 