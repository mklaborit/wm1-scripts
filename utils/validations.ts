export function checkEnvironmentVariable(variable?: string) {
  if (!variable || !process.env[variable]) {
    throw new Error("Environment variable not found");
  }

  return process.env[variable] as string;
}
