import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the Chancedee API URL from environment
    const chancedeeApiUrl =
      process.env.CHANCEDEE_API_URL ||
      process.env.NEXT_PUBLIC_CHANCEDEE_API_URL;

    if (!chancedeeApiUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Chancedee API URL not configured",
        },
        { status: 500 },
      );
    }

    // Forward the request to Chancedee API
    const response = await fetch(`${chancedeeApiUrl}/generate-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // Return the response with proper status
    return NextResponse.json(result, {
      status: response.ok ? 200 : response.status,
    });
  } catch (error) {
    console.error("Proxy API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to resume generation service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
