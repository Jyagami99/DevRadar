import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return NextResponse.json({
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        country: data.country
      });
    }
    
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get location' }, { status: 500 });
  }
}