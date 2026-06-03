export const NODE_ENVS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const NODE_ENV_VALUES = Object.values(NODE_ENVS);
export type NodeEnv = (typeof NODE_ENVS)[keyof typeof NODE_ENVS];