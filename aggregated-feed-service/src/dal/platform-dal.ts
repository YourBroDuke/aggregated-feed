import { PlatformDTO } from '../dto/PlatformDTO.js';
import { Platform, IPlatform } from '../models/Platform.js';

export interface IPlatformDal {
  getPlatforms(): Promise<PlatformDTO[]>;
}

export class PlatformDalImpl implements IPlatformDal {
  async getPlatforms(): Promise<PlatformDTO[]> {
    const platforms = await Platform.find();
    return platforms.map((p: IPlatform) => ({
      name: p.name,
      type: p.type,
      icon: p.icon,
      color: p.color,
      backgroundColor: p.backgroundColor,
      domain: p.domain,
    }));
  }
}