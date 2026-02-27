import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DeviceType } from "../../../../interfaces/auth/DeviceType";

export class DeviceTypeDto {
  @ApiProperty({
    enum: DeviceType,
    example: DeviceType.WEB,
    description: "Client device type",
  })
  @IsNotEmpty()
  @IsEnum(DeviceType)
  deviceType: DeviceType;
}
