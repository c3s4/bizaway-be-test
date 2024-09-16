import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, IsUrl, Max, Min, validateSync } from 'class-validator';

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

  @IsString()
  @IsOptional()
  REDIS_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number;

  @IsPositive()
  @IsOptional()
  REDIS_CACHE_DURATION_SECONDS: number;
}
export class EnvironmentObject {
  serverPort: number;
  plannerApi: {
    url: string;
    key: string;
  };
  database: {
    url: string;
  };
  redis?: {
    host?: string;
    port?: number;
    cacheDuration?: number;
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
  serverPort: parseInt(process.env.SERVER_PORT) || 3000,
  plannerApi: {
    url: process.env.PLANNER_API_URL,
    key: process.env.PLANNER_API_KEY,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    cacheDuration: parseInt(process.env.REDIS_CACHE_DURATION_SECONDS),
  },
});
