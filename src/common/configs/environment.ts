import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, IsUrl, Max, Min, validateSync } from 'class-validator';

class EnvironmentData {
  @IsNumber()
  @Min(0)
  @Max(65535)
  SERVER_PORT: number;
  @IsUrl()
  PLANNER_API_URL: string;
  @IsString()
  PLANNER_API_KEY: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  MONGO_LOCAL_PORT: number;

  @IsString()
  MONGO_ADMIN_USER: string;

  @IsString()
  MONGO_ADMIN_PASSWORD: string;

  @IsString()
  MONGO_DB_NAME: string;

  @IsString()
  DATABASE_URL: string;
}
export class EnvironmentObject {
  serverPort: number;
  plannerApi: {
    url: string;
    key: string;
  };
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentData, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

export const envConfig = (): EnvironmentObject => ({
  serverPort: parseInt(process.env.SERVER_PORT, 10) || 3000,
  plannerApi: {
    url: process.env.PLANNER_API_URL,
    key: process.env.PLANNER_API_KEY,
  },
});
