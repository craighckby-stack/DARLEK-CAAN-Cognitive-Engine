/**
 * ARCHITECTURAL ENVIRONMENT VALIDATOR ENGINE
 * Role: Validates, sanitizes, and provides typed access to environment variables.
 * Integration: Interfaced by diagnostic engine, sandbox orchestrator, and model router.
 * Siphoned from: craighckby-stack/AI_Agent_OS (Tessera Enterprise)
 */

export interface SystemEnvironmentConfig {
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly DATABASE_URL: string;
  readonly GEMINI_API_KEY: string;
  readonly OPENAI_API_KEY?: string;
  readonly ANTHROPIC_API_KEY?: string;
  readonly DEEPSEEK_API_KEY?: string;
  readonly OLLAMA_BASE_URL: string;
  readonly MEMORY_DIR: string;
  readonly CONSENSUS_WEIGHT_THRESHOLD: number;
  readonly SANDBOX_ISOLATION_LEVEL: 'strict' | 'permissive' | 'zero-leak';
  readonly DIAGNOSTICS_ENABLED: boolean;
  readonly LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  readonly PORT: number;
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private readonly config: SystemEnvironmentConfig;

  private constructor() {
    this.config = Object.freeze(this.validate());
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
    return this.config;
  }

  private validate(): SystemEnvironmentConfig {
    const nodeEnv = (process.env.NODE_ENV ?? 'development') as SystemEnvironmentConfig['NODE_ENV'];
    if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
      throw new Error(`Invalid NODE_ENV configuration: "${nodeEnv}". Allowed values: development, production, test.`);
    }

    const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
    const geminiApiKey = process.env.GEMINI_API_KEY ?? '';
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    const memoryDir = process.env.MEMORY_DIR ?? './memory';

    const rawConsensus = process.env.CONSENSUS_WEIGHT_THRESHOLD;
    const consensusWeight = rawConsensus !== undefined ? Number(rawConsensus) : 0.75;
    const validConsensus = Number.isNaN(consensusWeight) ? 0.75 : consensusWeight;

    const sandboxIsolation = (process.env.SANDBOX_ISOLATION_LEVEL ?? 'zero-leak') as SystemEnvironmentConfig['SANDBOX_ISOLATION_LEVEL'];
    if (sandboxIsolation !== 'strict' && sandboxIsolation !== 'permissive' && sandboxIsolation !== 'zero-leak') {
      throw new Error(`Invalid SANDBOX_ISOLATION_LEVEL configuration: "${sandboxIsolation}". Allowed values: strict, permissive, zero-leak.`);
    }

    const diagnosticsEnabled = process.env.DIAGNOSTICS_ENABLED !== 'false';

    const logLevel = (process.env.LOG_LEVEL ?? 'info') as SystemEnvironmentConfig['LOG_LEVEL'];
    if (logLevel !== 'debug' && logLevel !== 'info' && logLevel !== 'warn' && logLevel !== 'error') {
      throw new Error(`Invalid LOG_LEVEL configuration: "${logLevel}". Allowed values: debug, info, warn, error.`);
    }

    const rawPort = process.env.PORT;
    const port = rawPort !== undefined ? Number.parseInt(rawPort, 10) : 3000;
    const validPort = Number.isNaN(port) ? 3000 : port;

    return {
      NODE_ENV: nodeEnv,
      DATABASE_URL: databaseUrl,
      GEMINI_API_KEY: geminiApiKey,
      OPENAI_API_KEY: openaiApiKey,
      ANTHROPIC_API_KEY: anthropicApiKey,
      DEEPSEEK_API_KEY: deepseekApiKey,
      OLLAMA_BASE_URL: ollamaBaseUrl,
      MEMORY_DIR: memoryDir,
      CONSENSUS_WEIGHT_THRESHOLD: validConsensus,
      SANDBOX_ISOLATION_LEVEL: sandboxIsolation,
      DIAGNOSTICS_ENABLED: diagnosticsEnabled,
      LOG_LEVEL: logLevel,
      PORT: validPort,
    };
  }
}

export const envConfig = EnvironmentValidator.getInstance();