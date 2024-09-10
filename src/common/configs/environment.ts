export interface Environment {
  serverPort: number;
  plannerApi: {
    url: string;
    key: string;
  };
}

export const envConfig = (): Environment => ({
  serverPort: parseInt(process.env.SERVER_PORT, 10) || 3000,
  plannerApi: {
    url: process.env.PLANNER_API_URL,
    key: process.env.PLANNER_API_KEY,
  },
});
