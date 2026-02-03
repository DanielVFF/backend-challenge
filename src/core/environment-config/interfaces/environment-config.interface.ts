export interface EnvironmentConfigInterface {
  getNodeEnv(): string;

  // Database configuration
  getDatabaseHost(): string;
  getDatabaseUrl(): string;

  // Redis configuration
  getRedisHost(): string;
  getRedisPort(): number;
  getRedisPassword(): string | undefined;

  // Application configuration
  getPort(): number;

  // Elasticsearch configuration
  getElasticsearchUrl(): string;

  // Security configuration
  getSecretKey(): string;

  // CORS configuration
  getCorsOrigins(): string | string[] | boolean;

  // RabbitMQ configuration (for future use)
  getRabbitMqUrl(): string;
  getRabbitMqQueue(): string;

  // Supabase configuration
  getSupabaseUrl(): string;
  getSupabaseAnonKey(): string;
  getSupabaseServiceRoleKey(): string;
  getSupabaseBucketName(): string;

  getGoogleClientId(): string;
  getGoogleClientSecret(): string;
  getGoogleRedirectUri(): string;

  getEmailHost(): string;
  getEmailPort(): number;
  getEmailUser(): string;
  getEmailPassword(): string;
  getEmailFrom(): string;
  getEmailFromName(): string;

  getFrontendUrl(): string;
}
