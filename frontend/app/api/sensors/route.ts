import { NextResponse } from 'next/server';
import { generateRandomSensorPacket } from '../../../lib/sensor';

export async function GET() {
  return NextResponse.json(generateRandomSensorPacket());
}


