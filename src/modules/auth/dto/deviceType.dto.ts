import { IsEnum, IsNotEmpty } from 'class-validator';
import { DeviceType } from '../../../../interfaces/auth/DeviceType';

export class DeviceTypeDto {
    @IsNotEmpty()
    @IsEnum(DeviceType)
    deviceType: DeviceType;
}