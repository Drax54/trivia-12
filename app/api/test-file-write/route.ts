import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const TEST_FILE = path.join(process.cwd(), 'data', 'test-write.json');

export async function GET(req: NextRequest) {
  try {
    // Create or update the test file
    const data = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Test write successful'
    };

    console.log(`Writing test data to ${TEST_FILE}`);
    fs.writeFileSync(TEST_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true,
      message: 'File write test successful',
      path: TEST_FILE
    });
  } catch (error) {
    console.error('Error writing test file:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
} 