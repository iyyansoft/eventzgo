import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Check if environment variables are loaded
        const config = {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : undefined,
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        };

        const missing = [];
        if (!config.cloudName) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
        if (!config.apiKey) missing.push('CLOUDINARY_API_KEY');
        if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
        if (!config.uploadPreset) missing.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');

        if (missing.length > 0) {
            return NextResponse.json({
                status: 'error',
                message: 'Missing Cloudinary configuration',
                missing: missing,
                config: config
            }, { status: 500 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Cloudinary is configured correctly',
            config: {
                cloudName: config.cloudName,
                apiKey: config.apiKey?.substring(0, 4) + '***',
                apiSecret: config.apiSecret,
                uploadPreset: config.uploadPreset
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
