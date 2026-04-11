"use client";
import { FC, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { useAuth } from "@/core/states/auth/useAuth";
import { login } from "@/core/states/auth/requests/login";

export const LoginPageView: FC = () => {
  const environment = useEnvironment();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError(null);
    setLoading(true);

    try {
      const result = await login(environment.apiUrl, username.trim(), password);

      if (result.ok) {
        await refreshUser();
        router.push("/");
      } else if (result.reason === "rate_limited") {
        setError("Слишком много попыток. Попробуйте через 15 минут.");
      } else {
        setError("Неверный логин или пароль.");
      }
    } catch {
      setError("Ошибка подключения к серверу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      flex={{ col: true, align: "center", justify: "center" }}
      style={{ minHeight: "100vh", backgroundColor: "var(--background-primary)" }}
    >
      <Box
        flex={{ col: true, align: "center", gap: 32 }}
        style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}
      >
        <Box flex={{ col: true, align: "center", gap: 12 }}>
          <Image
            src="/nuts-logo.svg"
            alt="NUTS FAMILY"
            width={64}
            height={64}
            priority
          />
          <Typography.Title
            level={3}
            style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            NUTS Admin
          </Typography.Title>
          <Typography.Text type="secondary" size="small">
            Войдите в панель управления
          </Typography.Text>
        </Box>

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Box flex={{ col: true, gap: 6 }}>
            <label
              htmlFor="login-username"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              Логин
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              disabled={loading}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                padding: "0 16px",
                fontSize: 15,
                backgroundColor: "var(--background-primary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </Box>

          <Box flex={{ col: true, gap: 6 }}>
            <label
              htmlFor="login-password"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                padding: "0 16px",
                fontSize: 15,
                backgroundColor: "var(--background-primary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </Box>

          {error && (
            <Typography.Text
              type="error"
              size="small"
              style={{ textAlign: "center" }}
            >
              {error}
            </Typography.Text>
          )}

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={loading}
            style={{ width: "100%", marginTop: 4 }}
          >
            Войти
          </Button>
        </form>

      </Box>
    </Box>
  );
};
