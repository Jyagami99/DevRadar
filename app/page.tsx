import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Code, Search } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { NavLinks } from "@/components/nav-links";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold">DevRadar</span>
            </div>
            <NavLinks />
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-purple-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Encontre desenvolvedores perto de você
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Conecte-se com desenvolvedores que trabalham com as tecnologias que você tem interesse, todos em um
                    raio de até 50km da sua localização.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/search">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Desenvolvedores
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline">
                      <img src={"/github.svg"} className="mr-2 h-4 w-4" />
                      Cadastrar como Desenvolvedor
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-square">
                  <div className="absolute inset-0 bg-purple-100 rounded-full opacity-50"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-3/4 h-3/4 bg-white rounded-lg shadow-lg p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                          <Code className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">Desenvolvedor React</div>
                          <div className="text-sm text-gray-500">
                            2.5km de distância
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-md"></div>
                    </div>
                  </div>
                  <div className="absolute top-1/4 right-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Code className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 left-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Code className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Como funciona
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  O DevRadar conecta desenvolvedores baseado na localização e stack de tecnologias.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 md:gap-12">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <img
                    src={"/github.svg"}
                    className="h-8 w-8 text-purple-600"
                  />
                </div>
                <h3 className="text-xl font-bold">Cadastre-se com GitHub</h3>
                <p className="text-gray-500">
                  Conecte sua conta do GitHub para compartilhar seu perfil e tecnologias.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Compartilhe sua Localização</h3>
                <p className="text-gray-500">
                  Permita acesso à sua localização para ser encontrado por outros desenvolvedores próximos.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Search className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Encontre Desenvolvedores</h3>
                <p className="text-gray-500">
                  Busque por desenvolvedores por tecnologia em um raio de até 50km da sua localização.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <span className="font-semibold">DevRadar</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DevRadar. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
