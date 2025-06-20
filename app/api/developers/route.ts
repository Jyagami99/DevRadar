import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tech = searchParams.get("tech");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Missing latitude or longitude parameters" },
      { status: 400 }
    );
  }

  const lat = Number.parseFloat(latitude);
  const lon = Number.parseFloat(longitude);

  let filteredDevelopers = [...mockDevelopers];

  if (tech) {
    filteredDevelopers = filteredDevelopers.filter((dev) =>
      dev.techs.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
    );
  }

  filteredDevelopers = filteredDevelopers
    .map((dev) => {
      const distance = calculateDistance(
        lat,
        lon,
        dev.location.latitude,
        dev.location.longitude
      );

      return {
        ...dev,
        location: {
          ...dev.location,
          distance,
        },
      };
    })
    .filter((dev) => dev.location.distance <= 10) // 10km radius
    .sort((a, b) => a.location.distance - b.location.distance);

  return NextResponse.json(filteredDevelopers);
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { techs, latitude, longitude } = body;

    if (!techs || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newDeveloper = {
      id: Date.now().toString(),
      name: session.user.name || "",
      githubUsername: session.user.username || "",
      bio: session.user.bio || "",
      avatarUrl: session.user.image || "",
      techs: techs.split(",").map((tech: string) => tech.trim()),
      location: {
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      },
    };

    return NextResponse.json(newDeveloper, { status: 201 });
  } catch (error) {
    console.error("Error creating developer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
