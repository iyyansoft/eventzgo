import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF, JPG, and PNG are allowed.' },
                { status: 400 }
            );
        }

        // Convert file to base64 for Convex storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');

        // Create data URL
        const dataUrl = `data:${file.type};base64,${base64}`;

        return NextResponse.json({
            success: true,
            url: dataUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file', details: error.message },
            { status: 500 }
        );
    }
}
