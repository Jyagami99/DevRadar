import Link from "next/link";
import { getServerSession } from "next-auth";
import { DebugClient } from "./client";

export default async function DebugPage() {
  const session = await getServerSession();

  // Obter a URL base para a aplicação
  const baseUrl = process.env.NEXTAUTH_URL || "Não definido";

  // Verificar se o GitHub OAuth está configurado corretamente
  const isGitHubConfigured = !!(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  // Verificar se o NextAuth secret está definido
  const isSecretSet = !!process.env.NEXTAUTH_SECRET;

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Informações de Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-100 p-4 rounded-md">
          <h2 className="text-lg font-medium mb-2">Variáveis de Ambiente</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="font-medium mr-2">NEXTAUTH_URL:</span>
              <span
                className={
                  process.env.NEXTAUTH_URL ? "text-green-600" : "text-red-600"
                }
              >
                {process.env.NEXTAUTH_URL ? baseUrl : "Não definido"}
              </span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">NEXTAUTH_SECRET:</span>
              <span className={isSecretSet ? "text-green-600" : "text-red-600"}>
                {isSecretSet ? "Definido" : "Não definido"}
              </span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">GITHUB_CLIENT_ID:</span>
              <span
                className={
                  process.env.GITHUB_CLIENT_ID
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {process.env.GITHUB_CLIENT_ID ? "Definido" : "Não definido"}
              </span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">GITHUB_CLIENT_SECRET:</span>
              <span
                className={
                  process.env.GITHUB_CLIENT_SECRET
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {process.env.GITHUB_CLIENT_SECRET ? "Definido" : "Não definido"}
              </span>
            </li>
          </ul>

          <div className="mt-4">
            <h3 className="font-medium mb-1">Status da Configuração:</h3>
            <p
              className={
                isGitHubConfigured && isSecretSet
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {isGitHubConfigured && isSecretSet
                ? "✅ Todas as variáveis de ambiente necessárias estão definidas"
                : "❌ Algumas variáveis de ambiente necessárias estão faltando"}
            </p>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>A URL de callback do GitHub OAuth deve ser definida como:</p>
            <code className="bg-gray-200 px-2 py-1 rounded">
              {baseUrl}/api/auth/callback/github
            </code>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <h2 className="text-lg font-medium mb-2">
            Status de Autenticação do Servidor
          </h2>
          <p>
            <span className="font-medium mr-2">Autenticado:</span>
            <span className={session ? "text-green-600" : "text-red-600"}>
              {session ? "Sim" : "Não"}
            </span>
          </p>

          {session && (
            <>
              <div className="mt-4">
                <h3 className="font-medium mb-1">Informações do Usuário:</h3>
                <ul className="space-y-1">
                  <li>
                    <span className="font-medium">Nome:</span>{" "}
                    {session.user?.name}
                  </li>
                  <li>
                    <span className="font-medium">Email:</span>{" "}
                    {session.user?.email}
                  </li>
                  <li>
                    <span className="font-medium">GitHub Username:</span>{" "}
                    {session.user?.username || "Não disponível"}
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-1">Dados da Sessão:</h3>
                <pre className="bg-gray-200 p-2 rounded overflow-auto text-xs">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </>
          )}

          {!session && (
            <div className="mt-4">
              <Link href="/login" className="text-purple-600 hover:underline">
                Entrar para testar autenticação
              </Link>
            </div>
          )}
        </div>
      </div>

      <DebugClient />

      <div className="mt-6 bg-gray-100 p-4 rounded-md">
        <h2 className="text-lg font-medium mb-2">
          Passos para Solução de Problemas
        </h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Certifique-se de que todas as variáveis de ambiente estão definidas
            corretamente
          </li>
          <li>
            Verifique se seu app GitHub OAuth tem a URL de callback correta
          </li>
          <li>
            Confirme que seu app GitHub OAuth tem as permissões necessárias
          </li>
          <li>
            Certifique-se de que sua NEXTAUTH_URL corresponde à URL base da sua
            aplicação
          </li>
          <li>
            Reinicie sua aplicação após fazer alterações nas variáveis de
            ambiente
          </li>
        </ol>
      </div>
    </div>
  );
}
