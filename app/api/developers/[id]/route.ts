import { NextResponse } from "next/server";

const mockDevelopers = [
  {
    id: "1",
    name: "John Doe",
    githubUsername: "johndoe",
    bio: "Full Stack Developer",
    avatarUrl: "https://github.com/johndoe.png",
    techs: ["React", "Node.js", "TypeScript"],
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
    },
  },
  {
    id: "2",
    name: "Jane Smith",
    githubUsername: "janesmith",
    bio: "Frontend Developer",
    avatarUrl: "https://github.com/janesmith.png",
    techs: ["React", "Vue.js", "CSS"],
    location: {
      latitude: -23.5605,
      longitude: -46.6433,
    },
  },
  {
    id: "3",
    name: "Bob Johnson",
    githubUsername: "bobjohnson",
    bio: "Mobile Developer",
    avatarUrl: "https://github.com/bobjohnson.png",
    techs: ["React Native", "Flutter", "Swift"],
    location: {
      latitude: -23.5705,
      longitude: -46.6533,
    },
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const developer = mockDevelopers.find((dev) => dev.id === id);

  if (!developer) {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  }

  return NextResponse.json(developer);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { techs, latitude, longitude } = body;

    const developerIndex = mockDevelopers.findIndex((dev) => dev.id === id);

    if (developerIndex === -1) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    const updatedDeveloper = {
      ...mockDevelopers[developerIndex],
      ...(techs && {
        techs: techs.split(",").map((tech: string) => tech.trim()),
      }),
      ...(latitude &&
        longitude && {
          location: {
            latitude: Number.parseFloat(latitude),
            longitude: Number.parseFloat(longitude),
          },
        }),
    };

    return NextResponse.json(updatedDeveloper);
  } catch (error) {
    console.error("Error updating developer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const developerIndex = mockDevelopers.findIndex((dev) => dev.id === id);

  if (developerIndex === -1) {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
