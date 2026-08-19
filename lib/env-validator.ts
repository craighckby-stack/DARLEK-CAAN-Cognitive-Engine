/**
 * ARCHITECTURAL ENVIRONMENT VALIDATOR ENGINE
 * Role: Validates, sanitizes, and provides typed access to environment variables.
 * Integration: Interfaced by diagnostic engine, sandbox orchestrator, and model router.
 * Siphoned from: craighckby-stack/AI_Agent_OS (Tessera Enterprise)
 */

export interface SystemEnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  GEMINI_API_KEY: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  OLLAMA_BASE_URL: string;
  MEMORY_DIR: string;
  CONSENSUS_WEIGHT_THRESHOLD: number;
  SANDBOX_ISOLATION_LEVEL: 'strict' | 'permissive' | 'zero-leak';
  DIAGNOSTICS_ENABLED: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  PORT: number;
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private config: SystemEnvironmentConfig;

  private constructor() {
    this.config = this.validate();
  }

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  public get<K extends keyof SystemEnvironmentConfig>(key: K): SystemEnvironmentConfig[K] {
    return this.config[key];
  }

  public getAll(): Readonly<SystemEnvironmentConfig> {
    return Object.freeze({ ...this.config });
  }

  private validate(): SystemEnvironmentConfig {
    const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
    const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const memoryDir = process.env.MEMORY_DIR || './memory';
    const consensusWeight = parseFloat(process.env.CONSENSUS_WEIGHT_THRESHOLD || '0.75');
    const sandboxIsolation = (process.env.SANDBOX_ISOLATION_LEVEL || 'zero-leak') as 'strict' | 'permissive' | 'zero-leak';
    const diagnosticsEnabled = process.env.DIAGNOSTICS_ENABLED !== 'false';
    const logLevel = (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error';
    const port = parseInt(process.env.PORT || '3000', 10);

    return {
      NODE_ENV: nodeEnv,
      DATABASE_URL: databaseUrl,
      GEMINI_API_KEY: geminiApiKey,
      OPENAI_API_KEY: openaiApiKey,
      ANTHROPIC_API_KEY: anthropicApiKey,
      DEEPSEEK_API_KEY: deepseekApiKey,
      OLLAMA_BASE_URL: ollamaBaseUrl,
      MEMORY_DIR: memoryDir,
      CONSENSUS_WEIGHT_THRESHOLD: Number.isNaN(consensusWeight) ? 0.75 : consensusWeight,
      SANDBOX_ISOLATION_LEVEL: sandboxIsolation,
      DIAGNOSTICS_ENABLED: diagnosticsEnabled,
      LOG_LEVEL: logLevel,
      PORT: Number.isNaN(port) ? 3000 : port,
    };
  }
}

export const envConfig = EnvironmentValidator.getInstance();
