const { spawnSync } = require("child_process");
const os = require("os");
const isWindows = os.platform() === "win32";

const ENV_VARS = {
  DATABASE_URL: "libsql://digital-hiring-app-nasirudin.aws-ap-south-1.turso.io",
  TURSO_AUTH_TOKEN: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgzMTcwNjksImlkIjoiMDFhMDVmZmUtMWEwMS03ZDc1LTgxMjYtZWVjMGU5OTVlOGU0Iiwia2lkIjoiVHdQVnlpOUxUSEVGZXNIaFozd3NrUkltMjlHWGJXTl9LSFpaalVZSmJmVSIsInJpZCI6ImI5MTE2MTZlLTBhZGMtNDc2OC1hYTRmLWQyOWZiOGI5MDM1OSJ9.s6YEedfajpl1_I7uQkkCfwbvb1xM_2m7kJJqUBXwlOVqDnTyvonXDsrx0uUagrfwYO5vB54-0y_3E1lusJYADA",
  AUTH_SECRET: "y8n1_cPqHE3vuJO_6q8AvcmbcP-WurOB-YpbOgRn1jE",
  NEXTAUTH_SECRET: "y8n1_cPqHE3vuJO_6q8AvcmbcP-WurOB-YpbOgRn1jE",
  AUTH_URL: "https://digital-hiring-app.vercel.app",
  NEXTAUTH_URL: "https://digital-hiring-app.vercel.app",
  CRON_SECRET: "c1dw8SW1XTeop5iaAtMTMw-5uvS3Ivo01LNw4irWroc",
};

function addEnvVar(name, value, environment) {
  console.log(`Adding ${name} for ${environment}...`);
  const result = spawnSync("vercel", ["env", "add", name, environment], {
    input: value + "\n",
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    shell: isWindows,
    timeout: 30000,
  });
  if (result.status === 0) {
    console.log(`  OK: ${name} (${environment})`);
  } else {
    const err = (result.stderr || result.stdout || "").trim();
    if (err.includes("already exists")) {
      console.log(`  SKIP: ${name} already exists for ${environment}`);
    } else {
      console.log(`  WARN: ${name} - ${err || "unknown"}`);
    }
  }
}

function main() {
  console.log("Adding environment variables to Vercel...\n");
  for (const [name, value] of Object.entries(ENV_VARS)) {
    addEnvVar(name, value, "production");
    addEnvVar(name, value, "preview");
    addEnvVar(name, value, "development");
  }
  console.log("\nAll environment variables configured!");
}

main();
